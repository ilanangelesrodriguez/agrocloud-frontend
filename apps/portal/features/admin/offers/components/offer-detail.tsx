"use client";

import { ErrorState, LoadingState } from "@agrocloud/ui";
import { useOffer } from "../hooks";
import { OfferSummary } from "./offer-summary";
import { OfferForm } from "./offer-form";

/** Consultas separadas; la página de detalle ya no depende de `edit` booleano. */
export function OfferDetails({ offerId }: { offerId: string }) {
  const query = useOffer(offerId);
  if (query.isPending) return <LoadingState label="Cargando oferta" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  return <OfferSummary offer={query.data.data} reload={() => void query.refetch()} />;
}

export function OfferEdit({ offerId }: { offerId: string }) {
  const query = useOffer(offerId);
  if (query.isPending) return <LoadingState label="Cargando oferta" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  if (query.data.data.status !== "ARCHIVED") {
    return <OfferForm key={query.data.data.key} offer={query.data.data} />;
  }
  return <OfferSummary offer={query.data.data} reload={() => void query.refetch()} />;
}
