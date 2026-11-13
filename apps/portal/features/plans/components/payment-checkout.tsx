"use client";

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
      void status.refetch();
    },
    retry: false,
  });

  function openCheckout() {
    if (
      !paymentConfigured ||
      !sdkLoaded ||
      !window.CulqiCheckout ||
      submitted.current ||
      !pending ||
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

    checkout.culqi = () => {
      const token = checkout.token?.id;

      if (submitted.current) return;
      if (token && /^tkn_test_[A-Za-z0-9]+$/.test(token)) {
        submitted.current = true;
        setAwaitingConfirmation(true);
        checkout.close();
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
  const pending = status.data?.status === "PENDING";

  return (
    <section
      aria-label="Pago seguro"
      className="space-y-3 rounded-card border border-border bg-surface p-5"
    >
      <h3 className="text-lg font-semibold">Pago seguro</h3>
      <p className="text-sm text-muted">
        Orden {order.reference} · {money.format(order.amount_cents / 100)}
      </p>
      <p className="text-sm" role="status">
        Estado del pago:{" "}
        {status.isPending
          ? "Consultando…"
          : status.isError
            ? "No disponible"
            : paid
              ? "Confirmado"
              : awaitingConfirmation
                ? "Por confirmar"
                : pending
                  ? "Pendiente"
                  : (status.data?.status ?? "Desconocido")}
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
            isDisabled={!sdkLoaded || !pending || status.isError || awaitingConfirmation}
            type="button"
            variant="primary"
            onPress={openCheckout}
          >
            {charge.isPending ? "Procesando…" : "Pagar " + money.format(order.amount_cents / 100)}
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
