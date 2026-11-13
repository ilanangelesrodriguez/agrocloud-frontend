"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminRequest } from "@/features/admin/api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { chargeResponse, money, orderStatus } from "../schema";

type PendingOrder = {
  reference: string;
  offer_key: string;
  amount_cents: number;
  currency: "PEN";
  kind: "PLAN" | "RENEWAL" | "USER_ADDON" | "LOT_ADDON" | "AI_ADDON";
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
    CulqiCheckout?: new (publicKey: string, config: Record<string, unknown>) => CulqiCheckoutInstance;
  }
}

const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? "";
const sandboxEnabled = /^pk_test_[A-Za-z0-9]+$/.test(publicKey);

/** Test-only tokenization: card details go exclusively to Culqi, never to AgroCloud. */
export function SandboxCheckout({ order }: { order: PendingOrder }) {
  const { data: actor } = useCurrentUser();
  const cache = useQueryClient();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState("");

  const status = useQuery({
    queryKey: ["company", "subscription", "order", order.reference],
    queryFn: ({ signal }) => adminRequest(
      "subscription/orders/" + order.reference,
      orderStatus, { signal }, "company",
    ),
    refetchInterval: (query) => query.state.data?.status === "PAID" ? false : 5000,
    retry: false,
  });

  const charge = useMutation({
    mutationFn: (tokenId: string) => adminRequest(
      "subscription/orders/" + order.reference + "/charge",
      chargeResponse,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token_id: tokenId }) },
      "company",
    ),
    onSuccess: () => {
      toast.success("Cargo enviado. Comprobando la confirmación de Identity.");
      void status.refetch();
    },
    retry: false,
  });
  function openCheckout() {
    if (!sandboxEnabled || !sdkLoaded || !window.CulqiCheckout || charge.isPending) return;
    setSdkError("");
    const checkout = new window.CulqiCheckout(publicKey, {
      settings: { title: "AgroCloud", currency: "PEN", amount: order.amount_cents },
      client: {
        email: actor?.correo ?? "", firstName: actor?.nombre ?? "", lastName: actor?.apellido ?? "",
      },
      options: {
        lang: "es",
        paymentMethods: {
          tarjeta: true, yape: false, bancaMovil: false,
          agente: false, billetera: false, cuotealo: false,
        },
      },
    });
    checkout.culqi = () => {
      const token = checkout.token?.id;
      if (token && /^tkn_test_[A-Za-z0-9]+$/.test(token)) {
        checkout.close();
        charge.mutate(token);
      } else {
        setSdkError(checkout.error?.user_message ?? "Culqi no generó un token de prueba válido.");
      }
    };
    checkout.open();
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
    <section className="space-y-3 rounded-card border border-border bg-surface p-5" aria-label="Pago de prueba Culqi">
      <h3 className="text-lg font-semibold">Pago con Culqi · Sandbox</h3>
      <p className="text-sm text-muted">Orden {order.reference} · {money.format(order.amount_cents / 100)}</p>
      <p className="text-sm" role="status">
        Estado en Identity: {status.isPending ? "Consultando…" : status.isError ? "No disponible" : status.data?.status ?? "Desconocido"}
      </p>
      {!sandboxEnabled ? (
        <p role="status" className="text-sm text-muted">
          Checkout deshabilitado. Configura NEXT_PUBLIC_CULQI_PUBLIC_KEY con una llave pública pk_test_… para usar el sandbox.
        </p>
      ) : (
        <>
          <Script src="https://js.culqi.com/checkout-js" strategy="afterInteractive" onReady={() => setSdkLoaded(true)}
            onError={() => setSdkError("No se pudo cargar Culqi Checkout.")} />
          <Button type="button" variant="primary" isDisabled={!sdkLoaded || !pending || charge.isPending}
            onPress={openCheckout}>
            {charge.isPending ? "Procesando…" : "Pagar con tarjeta de prueba"}
          </Button>
        </>
      )}
      {paid ? <p className="text-sm">Pago aplicado. Comprueba los cupos de tu suscripción.</p> : null}
      {status.isError ? <p role="alert" className="text-sm">No se pudo consultar el estado de la orden. No repitas el cobro hasta verificarlo.</p> : null}
      {charge.error ? <p role="alert" className="text-sm">{charge.error.message} Revisa el estado de la orden antes de volver a intentar.</p> : null}
      {sdkError ? <p role="alert" className="text-sm">{sdkError}</p> : null}
      <p className="text-xs text-muted">
        Solo tarjetas de prueba. No se aceptan datos de tarjeta en AgroCloud. El cargo no activa el plan hasta que Identity reciba el evento firmado de Billing.
      </p>
    </section>
  );
}
