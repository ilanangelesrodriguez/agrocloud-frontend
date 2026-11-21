"use client";

import type { z } from "zod";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authentication3DS, chargeResponse, money, orderStatus } from "../schema";
import { adminRequest } from "@/features/admin/api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

type CheckoutOrder = { reference: string; amount_cents: number };
type CulqiCheckoutInstance = {
  token?: { id?: string };
  error?: { user_message?: string };
  culqi?: () => void;
  open(): void;
  close(): void;
};
type AuthenticationSession = {
  tokenId: string;
  deviceId: string;
  attemptId?: string;
  expiresAt?: string;
  completionSent: boolean;
};
type Culqi3DSInstance = {
  publicKey: string;
  settings: {
    charge: { totalAmount: number; returnUrl: string; currency: string };
    card: { email: string };
  };
  options: {
    showModal: boolean;
    showLoading: boolean;
    showIcon: boolean;
    closeModalAction: () => void;
  };
  generateDevice(): Promise<string | null>;
  initAuthentication(tokenId: string): void | Promise<void>;
  reset(): void;
};
declare global {
  interface Window {
    CulqiCheckout?: new (
      publicKey: string,
      config: Record<string, unknown>,
    ) => CulqiCheckoutInstance;
    Culqi3DS?: Culqi3DSInstance;
  }
}
const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? "";
export const paymentConfigured = /^pk_test_[A-Za-z0-9]+$/.test(publicKey);
const paymentStateLabels: Record<z.infer<typeof orderStatus>["payment_state"], string> = {
  READY: "Listo para pagar",
  DECLINED: "Cargo rechazado",
  PROCESSING: "Pago en procesamiento",
  REQUIRES_3DS: "Autenticación del banco pendiente",
  RECONCILIATION_REQUIRED: "Requiere conciliación",
  AWAITING_CONFIRMATION: "Esperando confirmación",
  CONFIRMED: "Pago confirmado",
  UNAVAILABLE: "Estado de procesamiento no disponible",
};

/** Los tokens y parámetros 3DS solo viven en memoria durante este pago. */
export function PaymentCheckout({ order, onDone }: { order: CheckoutOrder; onDone: () => void }) {
  const { data: actor } = useCurrentUser();
  const cache = useQueryClient();
  const mounted = useRef(false);
  const submitted = useRef(false);
  const session = useRef<AuthenticationSession | null>(null);
  const authenticationActive = useRef(false);
  const checkout = useRef<CulqiCheckoutInstance | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [threeDSLoaded, setThreeDSLoaded] = useState(false);
  const [authPhase, setAuthPhase] = useState<"idle" | "authenticating" | "verifying">("idle");
  const [sdkError, setSdkError] = useState("");
  const [hasAuthenticationSession, setHasAuthenticationSession] = useState(false);
  const [canContinueAuthentication, setCanContinueAuthentication] = useState(false);

  const status = useQuery({
    queryKey: ["company", "subscription", "order", order.reference],
    queryFn: ({ signal }) =>
      adminRequest("subscription/orders/" + order.reference, orderStatus, { signal }, "company"),
    refetchInterval: (query) => (query.state.data?.status === "PAID" ? false : 5000),
    retry: false,
  });

  async function refreshStatus() {
    if (!mounted.current) return;
    const result = await status.refetch();
    if (!mounted.current) return;
    if (result.data && ["READY", "DECLINED"].includes(result.data.payment_state)) {
      submitted.current = false;
      setAwaitingConfirmation(false);
      setAuthPhase("idle");
    }
  }

  const complete = useMutation({
    mutationFn: (parameters: z.infer<typeof authentication3DS>) => {
      const current = session.current;
      if (!current?.attemptId) throw new Error("La sesión de autenticación ya no está disponible.");
      return adminRequest(
        "subscription/orders/" + order.reference + "/complete-3ds",
        chargeResponse,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token_id: current.tokenId,
            device_fingerprint_id: current.deviceId,
            attempt_id: current.attemptId,
            authentication_3ds: parameters,
          }),
        },
        "company",
      );
    },
    onSuccess: () => {
      if (mounted.current) toast.success("Autenticación recibida. Estamos verificando el pago.");
    },
    onSettled: () => {
      if (!mounted.current) return;
      session.current = null;
      setHasAuthenticationSession(false);
      setCanContinueAuthentication(false);
      setAuthPhase("idle");
      window.Culqi3DS?.reset();
      void refreshStatus();
    },
    retry: false,
  });

  function startAuthentication() {
    const current = session.current;
    if (
      !current?.attemptId ||
      current.completionSent ||
      authenticationActive.current ||
      !window.Culqi3DS
    )
      return;
    if (!current.expiresAt || Date.parse(current.expiresAt) <= Date.now()) {
      setCanContinueAuthentication(false);
      setSdkError("La autenticación expiró. Cancela este intento para iniciar un nuevo pago.");
      return;
    }
    authenticationActive.current = true;
    setAuthPhase("authenticating");
    setSdkError("");
    try {
      Promise.resolve(window.Culqi3DS.initAuthentication(current.tokenId)).catch(() => {
        if (!mounted.current || session.current !== current || current.completionSent) return;
        authenticationActive.current = false;
        setAuthPhase("idle");
        setSdkError(
          "No se pudo completar la autenticación. Puedes continuarla o cancelar este intento.",
        );
      });
    } catch {
      authenticationActive.current = false;
      setAuthPhase("idle");
      setSdkError("No se pudo iniciar la autenticación del banco.");
    }
  }

  const charge = useMutation({
    mutationFn: ({ tokenId, deviceId }: { tokenId: string; deviceId: string }) =>
      adminRequest(
        "subscription/orders/" + order.reference + "/charge",
        chargeResponse,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token_id: tokenId, device_fingerprint_id: deviceId }),
        },
        "company",
      ),
    onSuccess: (result) => {
      if (!mounted.current) return;
      if (result.status === "REQUIRES_3DS") {
        if (!session.current) return;
        session.current.attemptId = result.attempt_id;
        session.current.expiresAt = result.authentication_expires_at;
        setHasAuthenticationSession(true);
        setCanContinueAuthentication(true);
        startAuthentication();
      } else {
        session.current = null;
        window.Culqi3DS?.reset();
        toast.success("Estamos verificando tu pago.");
      }
    },
    onSettled: () => {
      void refreshStatus();
    },
    retry: false,
  });

  const reconcile = useMutation({
    mutationFn: () =>
      adminRequest(
        "subscription/orders/" + order.reference + "/reconcile",
        orderStatus,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
        "company",
      ),
    onSuccess: (result) =>
      cache.setQueryData(["company", "subscription", "order", order.reference], result),
    onSettled: () => {
      void refreshStatus();
    },
    retry: false,
  });

  const cancelAuthentication = useMutation({
    onMutate: () => {
      authenticationActive.current = false;
      session.current = null;
      setHasAuthenticationSession(false);
      setCanContinueAuthentication(false);
      setAuthPhase("idle");
      window.Culqi3DS?.reset();
    },
    mutationFn: () =>
      adminRequest(
        "subscription/orders/" + order.reference + "/cancel-authentication",
        orderStatus,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
        "company",
      ),
    onSuccess: (result) => {
      if (!mounted.current) return;
      authenticationActive.current = false;
      session.current = null;
      window.Culqi3DS?.reset();
      submitted.current = false;
      setAwaitingConfirmation(false);
      setAuthPhase("idle");
      setSdkError("");
      charge.reset();
      complete.reset();
      cache.setQueryData(["company", "subscription", "order", order.reference], result);
    },
    onSettled: () => {
      void refreshStatus();
    },
    retry: false,
  });

  useEffect(() => {
    mounted.current = true;
    function receiveAuthentication(event: MessageEvent<unknown>) {
      // Culqi3DS devuelve el resultado al origen que inició la autenticación.
      if (
        event.origin !== window.location.origin ||
        !authenticationActive.current ||
        !session.current ||
        session.current.completionSent ||
        !event.data ||
        typeof event.data !== "object" ||
        Array.isArray(event.data)
      )
        return;
      const response = event.data as { parameters3DS?: unknown; error?: unknown };
      if (response.parameters3DS) {
        const parsed = authentication3DS.safeParse(response.parameters3DS);
        if (!parsed.success) {
          authenticationActive.current = false;
          setAuthPhase("idle");
          setSdkError(
            "El banco devolvió una autenticación incompleta. Cancela el intento para empezar nuevamente.",
          );
          return;
        }
        authenticationActive.current = false;
        session.current.completionSent = true;
        setCanContinueAuthentication(false);
        setAuthPhase("verifying");
        complete.mutate(parsed.data);
      } else if (response.error) {
        authenticationActive.current = false;
        setAuthPhase("idle");
        setSdkError(
          "El banco no pudo autenticar el pago. Puedes continuar la autenticación o cancelar este intento.",
        );
      }
    }
    window.addEventListener("message", receiveAuthentication);
    return () => {
      mounted.current = false;
      window.removeEventListener("message", receiveAuthentication);
      authenticationActive.current = false;
      session.current = null;
      checkout.current?.close();
      window.Culqi3DS?.reset();
    };
  }, [complete.mutate]);

  const canPay =
    status.data?.status === "PENDING" && ["READY", "DECLINED"].includes(status.data.payment_state);

  function openCheckout() {
    if (
      !paymentConfigured ||
      !sdkLoaded ||
      !threeDSLoaded ||
      !window.CulqiCheckout ||
      !window.Culqi3DS ||
      submitted.current ||
      !canPay ||
      status.isError ||
      !actor?.correo
    )
      return;
    setSdkError("");
    charge.reset();
    complete.reset();
    cancelAuthentication.reset();
    const instance = new window.CulqiCheckout(publicKey, {
      settings: { title: "AgroCloud", currency: "PEN", amount: order.amount_cents },
      client: {
        email: actor.correo,
        firstName: actor.nombre ?? "",
        lastName: actor.apellido ?? "",
      },
      options: {
        modal: true,
        lang: "es",
        paymentMethods: {
          tarjeta: true,
          yape: false,
          bancaMovil: false,
          agente: false,
          billetera: false,
          cuotealo: false,
        },
      },
    });
    checkout.current = instance;
    instance.culqi = async () => {
      const token = instance.token?.id;
      if (submitted.current || !mounted.current) return;
      if (!token || !/^tkn_test_[A-Za-z0-9]+$/.test(token)) {
        setSdkError(instance.error?.user_message ?? "No se pudo autorizar la tarjeta.");
        return;
      }
      submitted.current = true;
      setAwaitingConfirmation(true);
      instance.close();
      const latest = await status.refetch();
      if (!mounted.current) return;
      if (
        latest.isError ||
        latest.data?.status !== "PENDING" ||
        !["READY", "DECLINED"].includes(latest.data.payment_state)
      ) {
        submitted.current = false;
        setAwaitingConfirmation(false);
        setSdkError("El pago requiere verificar su estado antes de continuar.");
        return;
      }
      const sdk = window.Culqi3DS;
      try {
        if (!sdk) throw new Error("3DS no disponible");
        sdk.reset();
        sdk.publicKey = publicKey;
        sdk.settings = {
          charge: {
            totalAmount: order.amount_cents,
            currency: "PEN",
            returnUrl: window.location.origin + window.location.pathname,
          },
          card: { email: actor.correo },
        };
        sdk.options = {
          showModal: true,
          showLoading: true,
          showIcon: true,
          closeModalAction: () => {
            if (!mounted.current || session.current?.completionSent) return;
            authenticationActive.current = false;
            setAuthPhase("idle");
            setSdkError("La autenticación no terminó. Continúa con tu banco o cancela el intento.");
          },
        };
        const deviceId = await sdk.generateDevice();
        if (!mounted.current) return;
        if (
          !deviceId ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deviceId)
        )
          throw new Error("Device no disponible");
        session.current = { tokenId: token, deviceId, completionSent: false };
        charge.mutate({ tokenId: token, deviceId });
      } catch {
        submitted.current = false;
        setAwaitingConfirmation(false);
        session.current = null;
        setSdkError(
          "No se pudo preparar la autenticación segura. No se solicitó el cargo; intenta nuevamente.",
        );
      }
    };
    try {
      instance.open();
    } catch {
      setSdkError("No se pudo abrir el formulario de pago. Intenta nuevamente.");
    }
  }

  useEffect(() => {
    if (status.data?.status === "PAID") {
      session.current = null;
      authenticationActive.current = false;
      window.Culqi3DS?.reset();
      toast.success("Pago confirmado y suscripción actualizada.");
      void cache.invalidateQueries({ queryKey: ["company", "subscription"] });
      void cache.invalidateQueries({ queryKey: ["notifications"] });
    }
  }, [status.data?.status, cache]);

  const paid = status.data?.status === "PAID";
  const requires3DS =
    status.data?.payment_state === "REQUIRES_3DS" || authPhase === "authenticating";
  const pending =
    charge.isPending || complete.isPending || cancelAuthentication.isPending || reconcile.isPending;
  return (
    <section
      aria-label="Pago seguro"
      className="space-y-3 rounded-card border border-border bg-surface p-5"
    >
      <h3 className="text-lg font-semibold">Pago seguro</h3>
      <p className="text-sm text-muted">
        Orden {order.reference} · {money.format(order.amount_cents / 100)}
      </p>
      {requires3DS && !paid ? (
        <div className="space-y-3 rounded-xl border border-border p-4" aria-live="polite">
          <p>
            Tu banco requiere autenticar esta compra antes de cobrar. Completa el desafío que
            aparece en pantalla.
          </p>
          <p>
            {authPhase === "authenticating"
              ? "Autenticación en curso…"
              : authPhase === "verifying"
                ? "Verificando autenticación y cargo…"
                : "Autenticación pendiente"}
          </p>
          {!hasAuthenticationSession ? (
            <p>
              La sesión de tarjeta no está disponible en esta pantalla. Cancela la autenticación
              pendiente para iniciar un nuevo pago.
            </p>
          ) : null}
          <Button
            isDisabled={pending || authPhase !== "idle" || !canContinueAuthentication}
            onPress={startAuthentication}
          >
            Continuar autenticación del banco
          </Button>
          <Button
            variant="secondary"
            isDisabled={pending || authPhase === "verifying"}
            onPress={() => cancelAuthentication.mutate()}
          >
            Cancelar autenticación pendiente
          </Button>
        </div>
      ) : null}
      {status.data?.payment_state === "RECONCILIATION_REQUIRED" ||
      status.data?.payment_state === "AWAITING_CONFIRMATION" ? (
        <div className="space-y-3">
          <p className="text-sm">
            {status.data.payment_state === "RECONCILIATION_REQUIRED"
              ? "El resultado anterior requiere verificación. No repitas el cobro; verifica esta referencia en Culqi."
              : "Billing confirmó el cargo. Esperamos la actualización de tu suscripción."}
          </p>
          <Button isDisabled={pending} variant="secondary" onPress={() => reconcile.mutate()}>
            {reconcile.isPending ? "Verificando…" : "Verificar pago"}
          </Button>
        </div>
      ) : null}
      <p className="text-sm" role="status">
        Estado del pago:{" "}
        {status.isPending
          ? "Consultando…"
          : status.isError
            ? "No disponible"
            : status.data
              ? paymentStateLabels[status.data.payment_state]
              : "Desconocido"}
      </p>
      {!paymentConfigured ? (
        <p className="text-sm text-muted">
          El servicio de pago no está disponible en este momento.
        </p>
      ) : (
        <>
          <Script
            src="https://js.culqi.com/checkout-js"
            strategy="afterInteractive"
            onError={() => setSdkError("No se pudo cargar Culqi Checkout.")}
            onReady={() => setSdkLoaded(true)}
          />
          <Script
            src="https://3ds.culqi.com"
            strategy="afterInteractive"
            onError={() => setSdkError("No se pudo cargar la autenticación Culqi3DS.")}
            onReady={() => setThreeDSLoaded(true)}
          />
          {!paid ? (
            <Button
              isDisabled={
                !sdkLoaded ||
                !threeDSLoaded ||
                !actor?.correo ||
                !canPay ||
                pending ||
                awaitingConfirmation ||
                status.isError
              }
              onPress={openCheckout}
            >
              Pagar {money.format(order.amount_cents / 100)}
            </Button>
          ) : null}
        </>
      )}
      {paid ? (
        <>
          <p className="text-sm">Pago confirmado. Los cupos de tu suscripción se actualizaron.</p>
          <Button type="button" variant="secondary" onPress={onDone}>
            Volver a las ofertas
          </Button>
        </>
      ) : null}
      {status.isError ? (
        <p className="text-sm" role="alert">
          No se pudo consultar el estado. No repitas el cobro hasta verificarlo.
        </p>
      ) : null}
      {charge.error || complete.error || reconcile.error || cancelAuthentication.error ? (
        <p className="text-sm" role="alert">
          {
            (charge.error ?? complete.error ?? reconcile.error ?? cancelAuthentication.error)
              ?.message
          }{" "}
          Revisa el estado de la orden antes de volver a intentar.
        </p>
      ) : null}
      {sdkError ? (
        <p className="text-sm" role="alert">
          {sdkError}
        </p>
      ) : null}
      <p className="text-xs text-muted">
        Procesamiento seguro mediante Culqi. En este entorno los pagos son simulados.
      </p>
    </section>
  );
}
