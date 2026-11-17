"use client";

import type { z } from "zod";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chargeResponse, money, orderStatus } from "../schema";

import { adminRequest } from "@/features/admin/api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

type CheckoutOrder = {
  reference: string;
  amount_cents: number;
};

type CulqiCheckoutInstance = {
  token?: { id?: string };
  error?: { user_message?: string; merchant_message?: string };
  culqi?: () => void;
  open(): void;
  close(): void;
};

declare global {
  interface Window {
    CulqiCheckout?: new (
      publicKey: string,
      config: Record<string, unknown>,
    ) => CulqiCheckoutInstance;
  }
}

const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? "";

export const paymentConfigured = /^pk_test_[A-Za-z0-9]+$/.test(publicKey);

const paymentStateLabels: Record<z.infer<typeof orderStatus>["payment_state"], string> = {
  READY: "Listo para pagar",
  DECLINED: "Cargo rechazado",
  PROCESSING: "Pago en procesamiento",
  RECONCILIATION_REQUIRED: "Requiere conciliación",
  AWAITING_CONFIRMATION: "Esperando confirmación",
  CONFIRMED: "Pago confirmado",
  UNAVAILABLE: "Estado de procesamiento no disponible",
};

/** Test-only tokenization: card details go exclusively to Culqi, never to AgroCloud. */
export function PaymentCheckout({ order, onDone }: { order: CheckoutOrder; onDone: () => void }) {
  const { data: actor } = useCurrentUser();
  const cache = useQueryClient();
  const submitted = useRef(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState("");

  const status = useQuery({
    queryKey: ["company", "subscription", "order", order.reference],
    queryFn: ({ signal }) =>
      adminRequest("subscription/orders/" + order.reference, orderStatus, { signal }, "company"),
    refetchInterval: (query) => (query.state.data?.status === "PAID" ? false : 5000),
    retry: false,
  });

  const charge = useMutation({
    mutationFn: (tokenId: string) =>
      adminRequest(
        "subscription/orders/" + order.reference + "/charge",
        chargeResponse,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token_id: tokenId }),
        },
        "company",
      ),
    onSuccess: () => {
      toast.success("Estamos verificando tu pago.");
    },
    onSettled: () => {
      void status.refetch();
    },
    retry: false,
  });

  const reconcile = useMutation({
    mutationFn: () => adminRequest(
      "subscription/orders/" + order.reference + "/reconcile", orderStatus,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, "company",
    ),
    onSuccess: (result) => {
      cache.setQueryData(["company", "subscription", "order", order.reference], result);
      if (result.payment_state === "READY") {
        submitted.current = false;
        setAwaitingConfirmation(false);
        charge.reset();
      }
    },
    onSettled: () => { void status.refetch(); },
    retry: false,
  });

  function openCheckout() {
    if (
      !paymentConfigured ||
      !sdkLoaded ||
      !window.CulqiCheckout ||
      submitted.current ||
      !canPay ||
      status.isError
    )
      return;
    setSdkError("");
    const checkout = new window.CulqiCheckout(publicKey, {
      settings: { title: "AgroCloud", currency: "PEN", amount: order.amount_cents },
      client: {
        email: actor?.correo ?? "",
        firstName: actor?.nombre ?? "",
        lastName: actor?.apellido ?? "",
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

    checkout.culqi = async () => {
      const token = checkout.token?.id;

      if (submitted.current) return;
      if (token && /^tkn_test_[A-Za-z0-9]+$/.test(token)) {
        submitted.current = true;
        setAwaitingConfirmation(true);
        checkout.close();
        const current = await status.refetch();

        if (
          current.isError ||
          current.data?.status !== "PENDING" ||
          current.data.payment_state !== "READY"
        ) {
          submitted.current = false;
          setAwaitingConfirmation(false);
          setSdkError("El pago requiere verificar su estado antes de continuar.");

          return;
        }
        charge.mutate(token);
      } else {
        setSdkError(checkout.error?.user_message ?? "No se pudo autorizar la tarjeta.");
      }
    };
    try {
      checkout.open();
    } catch {
      setSdkError("No se pudo abrir el formulario de pago. Intenta nuevamente.");
    }
  }

  useEffect(() => {
    if (status.data?.status === "PAID") {
      toast.success("Pago confirmado y suscripción actualizada.");
      void cache.invalidateQueries({ queryKey: ["company", "subscription"] });
    }
  }, [status.data?.status, cache]);

  const paid = status.data?.status === "PAID";

  const canPay = status.data?.status === "PENDING" && status.data?.payment_state === "READY";

  return (
    <section
      aria-label="Pago seguro"
      className="space-y-3 rounded-card border border-border bg-surface p-5"
    >
      <h3 className="text-lg font-semibold">Pago seguro</h3>
      <p className="text-sm text-muted">
        Orden {order.reference} · {money.format(order.amount_cents / 100)}
      </p>
      {status.data?.payment_state === "RECONCILIATION_REQUIRED" ||
        status.data?.payment_state === "AWAITING_CONFIRMATION" ? (
        <div className="space-y-3">
          <p className="text-sm">
            {status.data.payment_state === "RECONCILIATION_REQUIRED"
              ? "El resultado del intento anterior está por verificar. Comprueba el pago antes de intentar nuevamente. Si continúa pendiente, solicita revisión de esta referencia en Culqi."
              : "Billing confirmó el cargo. Estamos esperando la actualización de tu suscripción."}
          </p>
          <Button isDisabled={reconcile.isPending || charge.isPending} variant="secondary"
            onPress={() => reconcile.mutate()}>
            {reconcile.isPending ? "Verificando…" : "Verificar pago"}
          </Button>
          {reconcile.error ? <p role="alert">{reconcile.error.message}</p> : null}
        </div>
      ) : null}
      <p className="text-sm" role="status">
        Estado del pago:{" "}
        {status.isPending
          ? "Consultando…"
          : status.isError
            ? "No disponible"
            : (status.data?.status ?? "Desconocido")}
      </p>
      <p className="text-sm" role="status">
        Estado de procesamiento:{" "}
        {status.isPending
          ? "Consultando…"
          : status.isError
            ? "No disponible"
            : status.data
              ? paymentStateLabels[status.data.payment_state] +
                " (" +
                status.data.payment_state +
                ")"
              : "Desconocido"}
      </p>
      {!paymentConfigured ? (
        <p className="text-sm text-muted" role="status">
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
          <Button
            isDisabled={!sdkLoaded || !canPay || charge.isPending || reconcile.isPending || awaitingConfirmation}
            onPress={openCheckout}
          >
            Pagar {money.format(order.amount_cents / 100)}
          </Button>
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
          No se pudo consultar el estado de la orden. No repitas el cobro hasta verificarlo.
        </p>
      ) : null}
      {charge.error ? (
        <p className="text-sm" role="alert">
          {charge.error.message} Revisa el estado de la orden antes de volver a intentar.
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
