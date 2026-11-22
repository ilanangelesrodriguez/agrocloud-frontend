"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertDialog, Button } from "@heroui/react";
import { EmptyState, FormNotice, InlineNotice, LoadingState } from "@agrocloud/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { companyOffers, money, orderResponse } from "../schema";

import { PaymentCheckout, paymentConfigured } from "./payment-checkout";

import { adminRequest } from "@/features/admin/api";
import { AdminError } from "@/features/admin/components/admin-ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";

const queryKey = ["company", "subscription", "offers"];
const labels = {
  PLAN: "Contratar",
  RENEWAL: "Renovar",
  USER_ADDON: "Usuarios adicionales",
  LOT_ADDON: "Lotes adicionales",
  AI_ADDON: "Análisis IA adicionales",
};

export function SubscriptionOffers({ selectedOfferKey }: { selectedOfferKey?: string }) {
  const { data: actor } = useCurrentUser();
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const preferredOfferKey =
    selectedOfferKey ??
    (actor?.onboarding?.requires_price_confirmation
      ? (actor.onboarding.selected_offer_key ?? undefined)
      : undefined);
  const cache = useQueryClient();
  const canView = canManageCompany(actor, "suscripciones.ver");
  const canOrder = canManageCompany(actor, "suscripciones.gestionar");
  const offers = useQuery({
    queryKey,
    enabled: canView,
    queryFn: ({ signal }) =>
      adminRequest("subscription/offers", companyOffers, { signal }, "company"),
    retry: false,
  });
  const order = useMutation({
    mutationFn: (key: string) =>
      adminRequest(
        "subscription/orders",
        orderResponse,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offer_key: key }),
        },
        "company",
      ),
    onSettled: async () => {
      await cache.invalidateQueries({ queryKey });
    },
    retry: false,
  });

  const pending = offers.data?.pending_order;
  const checkout = order.data ?? pending;
  const checkoutReady = canOrder && paymentConfigured;
  const availableOffers = offers.data?.data ?? [];
  const selectedOffer = availableOffers.find(
    (offer) => offer.kind === "PLAN" && offer.key === preferredOfferKey,
  );
  const confirmedOffer = availableOffers.find((offer) => offer.key === confirmKey);
  const visibleOffers = selectedOffer
    ? [selectedOffer, ...availableOffers.filter((offer) => offer !== selectedOffer)]
    : availableOffers;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Ofertas y órdenes</h2>
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-accent hover:bg-default"
        >
          Ahora no, continuar con mi acceso actual
        </Link>
      </div>
      <p className="text-sm text-muted">
        Confirma la oferta vigente antes de crear una orden. El checkout actual funciona en el
        entorno de prueba de Culqi.
      </p>
      {!canView ? (
        <InlineNotice
          title="Acceso a suscripciones"
          description="Tu cuenta necesita permiso para ver las suscripciones de la empresa."
          status="warning"
        />
      ) : null}
      {preferredOfferKey && offers.isSuccess && !selectedOffer && !pending ? (
        <InlineNotice
          title="El plan seleccionado no está disponible"
          description="Consulta las ofertas que tu empresa puede contratar actualmente."
          status="warning"
        />
      ) : null}
      {canOrder && !paymentConfigured ? (
        <InlineNotice
          title="Pago no disponible"
          description="El servicio de pago no está disponible en este momento."
          status="warning"
        />
      ) : null}
      {order.error ? <FormNotice message={order.error.message} /> : null}
      {!canView ? null : checkout &&
        checkoutReady &&
        (order.data || (!order.isPending && !order.error)) ? (
        <PaymentCheckout
          key={checkout.reference}
          order={checkout}
          onDone={() => {
            order.reset();
            void offers.refetch();
          }}
        />
      ) : offers.isPending ? (
        <LoadingState label="Cargando ofertas" />
      ) : offers.isError ? (
        <AdminError
          error={offers.error}
          retry={() => {
            void offers.refetch();
          }}
        />
      ) : pending ? (
        <div className="space-y-2 rounded-card border border-border bg-surface p-4">
          <h3 className="font-semibold">Orden pendiente</h3>
          <p>
            {pending.reference} · {money.format(pending.amount_cents / 100)}
          </p>
          {checkoutReady ? (
            <Button
              isDisabled={order.isPending}
              variant="secondary"
              onPress={() => order.mutate(pending.offer_key)}
            >
              Continuar con el pago
            </Button>
          ) : null}
        </div>
      ) : visibleOffers.length ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visibleOffers.map((offer) => (
            <li
              key={offer.key}
              className="space-y-2 rounded-card border border-border bg-surface p-4"
            >
              {offer === selectedOffer ? (
                <p className="text-sm text-accent">Plan seleccionado</p>
              ) : null}
              <h3 className="font-semibold">{offer.name ?? offer.plan ?? labels[offer.kind]}</h3>
              <p>
                {labels[offer.kind]} · {money.format(offer.amount_cents / 100)}
              </p>
              {offer.description ? <p>{offer.description}</p> : null}
              {offer.duration_days ? <p>Duración: {offer.duration_days} días</p> : null}
              {offer.limits ? (
                <p>
                  {offer.limits.usuarios} usuarios · {offer.limits.lotes} lotes ·{" "}
                  {offer.limits.analisis_ia} análisis IA
                </p>
              ) : null}
              {offer.quantity ? <p>Cantidad adicional: {offer.quantity}</p> : null}
              {checkoutReady ? (
                <Button
                  isDisabled={order.isPending}
                  variant="primary"
                  onPress={() => setConfirmKey(offer.key)}
                >
                  Continuar con el pago
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Sin ofertas aplicables"
          description="No hay ofertas disponibles para tu suscripción en este momento."
        />
      )}
      <AlertDialog
        isOpen={!!confirmedOffer}
        onOpenChange={(open) => {
          if (!open) setConfirmKey(null);
        }}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container placement="center" size="sm">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Icon status="accent" />
                <AlertDialog.Heading>Confirma las condiciones vigentes</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                {confirmedOffer ? (
                  <div className="space-y-3">
                    <p className="font-semibold">
                      {confirmedOffer.name ?? confirmedOffer.plan ?? labels[confirmedOffer.kind]}
                    </p>
                    <p className="text-2xl font-semibold">
                      {money.format(confirmedOffer.amount_cents / 100)}
                    </p>
                    {confirmedOffer.duration_days ? (
                      <p className="text-sm">
                        Vigencia del plan: {confirmedOffer.duration_days} días
                      </p>
                    ) : null}
                    {confirmedOffer.limits ? (
                      <p className="text-sm">
                        {confirmedOffer.limits.usuarios} usuarios · {confirmedOffer.limits.lotes}{" "}
                        lotes · {confirmedOffer.limits.analisis_ia} análisis IA
                      </p>
                    ) : null}
                    <p className="text-xs text-muted">
                      La selección durante el registro no reserva el precio. Al crear la orden se
                      fijarán las condiciones disponibles en el servidor; revisarás su importe antes
                      de confirmar el pago.
                    </p>
                  </div>
                ) : null}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="secondary">
                  Volver
                </Button>
                <Button
                  variant="primary"
                  isDisabled={!confirmedOffer || order.isPending || !checkoutReady}
                  onPress={() => {
                    if (confirmedOffer && !order.isPending) {
                      const key = confirmedOffer.key;
                      setConfirmKey(null);
                      order.mutate(key);
                    }
                  }}
                >
                  Confirmar y crear orden
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </section>
  );
}
