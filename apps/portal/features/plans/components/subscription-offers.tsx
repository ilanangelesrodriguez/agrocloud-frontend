"use client";

import { Button } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminRequest } from "@/features/admin/api";
import { AdminError } from "@/features/admin/components/admin-ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";

import { companyOffers, money, orderResponse } from "../schema";
import { PaymentCheckout, paymentConfigured } from "./payment-checkout";

const queryKey = ["company", "subscription", "offers"];
const labels = { PLAN: "Contratar", RENEWAL: "Renovar", USER_ADDON: "Usuarios adicionales", LOT_ADDON: "Lotes adicionales", AI_ADDON: "Análisis IA adicionales" };

export function SubscriptionOffers() {
  const { data: actor } = useCurrentUser();
  const cache = useQueryClient();
  const canOrder = canManageCompany(actor, "suscripciones.gestionar");
  const offers = useQuery({ queryKey, enabled: canManageCompany(actor, "suscripciones.ver"),
    queryFn: ({ signal }) => adminRequest("subscription/offers", companyOffers, { signal }, "company"), retry: false });
  const order = useMutation({
    mutationFn: (key: string) => adminRequest("subscription/orders", orderResponse, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offer_key: key }),
    }, "company"),
    onSettled: async () => { await cache.invalidateQueries({ queryKey }); },
    retry: false,
  });

  const pending = offers.data?.pending_order;
  const checkout = order.data ?? pending;
  const checkoutReady = canOrder && paymentConfigured;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Ofertas y órdenes</h2>
      <p className="text-sm text-muted">Selecciona una oferta y continúa con el pago seguro.</p>
      {canOrder && !paymentConfigured ? <p role="alert">El servicio de pago no está disponible en este momento.</p> : null}
      {order.error ? <p role="alert">{order.error.message}</p> : null}
      {checkout && checkoutReady && (order.data || !order.isPending && !order.error) ? (
        <PaymentCheckout key={checkout.reference} order={checkout} onDone={() => {
          order.reset();
          void offers.refetch();
        }} />
      ) : offers.isPending ? <p role="status">Cargando ofertas…</p> : offers.isError ? (
        <AdminError error={offers.error} retry={() => { void offers.refetch(); }} />
      ) : pending ? (
        <div className="space-y-2 rounded-card border border-border bg-surface p-4">
          <h3 className="font-semibold">Orden pendiente</h3>
          <p>{pending.reference} · {money.format(pending.amount_cents / 100)}</p>
          {checkoutReady ? <Button isDisabled={order.isPending} variant="secondary" onPress={() => order.mutate(pending.offer_key)}>Continuar con el pago</Button> : null}
        </div>
      ) : offers.data.data.length ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {offers.data.data.map((offer) => (
            <li key={offer.key} className="space-y-2 rounded-card border border-border bg-surface p-4">
              <h3 className="font-semibold">{offer.name ?? offer.plan ?? labels[offer.kind]}</h3>
              <p>{labels[offer.kind]} · {money.format(offer.amount_cents / 100)}</p>
              {offer.description ? <p>{offer.description}</p> : null}
              {offer.duration_days ? <p>Duración: {offer.duration_days} días</p> : null}
              {offer.limits ? <p>{offer.limits.usuarios} usuarios · {offer.limits.lotes} lotes · {offer.limits.analisis_ia} análisis IA</p> : null}
              {offer.quantity ? <p>Cantidad adicional: {offer.quantity}</p> : null}
              {checkoutReady ? <Button isDisabled={order.isPending} variant="primary" onPress={() => order.mutate(offer.key)}>Continuar con el pago</Button> : null}
            </li>
          ))}
        </ul>
      ) : <p>No hay ofertas aplicables a tu suscripción en este momento.</p>}
    </section>
  );
}
