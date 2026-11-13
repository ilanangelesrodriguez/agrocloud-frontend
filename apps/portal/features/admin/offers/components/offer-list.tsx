"use client";

import Link from "next/link";
import { EmptyState, LoadingState, PageHeader, StatusBadge, ErrorState } from "@agrocloud/ui";
import { useOffers } from "../hooks";
import { stateLabels, kindLabels, linkClass, offerTone } from "../labels";
import { money } from "../schema";

export function OfferList() {
  const query = useOffers();

  return (
    <section className="space-y-4">
      <PageHeader title="Ofertas comerciales" />
      <Link className={linkClass} href="/admin/plans/new">
        Crear borrador
      </Link>
      {query.isPending ? (
        <LoadingState label="Cargando ofertas" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : query.data.data.length ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {query.data.data.map((offer) => (
            <li key={offer.key} className="p-4">
              <Link className={linkClass} href={"/admin/plans/" + offer.key}>
                {offer.terms.name}
              </Link>
              <p>
                {kindLabels[offer.terms.kind]} ·{" "}
                <StatusBadge tone={offerTone(offer.status)}>
                  {stateLabels[offer.status]}
                </StatusBadge>{" "}
                · Versión {offer.version} · {money.format(offer.terms.amount_cents / 100)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No hay ofertas administradas"
          description="Crea una nueva oferta para comenzar."
        />
      )}
    </section>
  );
}
