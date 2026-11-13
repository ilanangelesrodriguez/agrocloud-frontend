"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { adminRequest } from "../api";
import { AdminError } from "./admin-ui";

const offers = z.object({ data: z.array(z.object({
  key: z.string(), name: z.string(), amount_cents: z.number(), currency: z.literal("PEN"),
  duration_days: z.number(),
})) });
const price = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function PublishedPlans() {
  const query = useQuery({ queryKey: ["admin", "offers"], queryFn: ({ signal }) =>
    adminRequest("offers", offers, { signal }), retry: false });
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Planes publicados</h1>
      <p className="text-muted">Ofertas vigentes del catálogo de Identity. El plan gratuito se asigna al aprobar una solicitud empresarial.</p>
      {query.isPending ? <p role="status">Cargando planes…</p> : query.isError ? (
        <AdminError error={query.error} retry={() => { void query.refetch(); }} />
      ) : query.data.data.length ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {query.data.data.map((offer) => <li className="p-4" key={offer.key}>
            <strong>{offer.name}</strong>
            <p>{price.format(offer.amount_cents / 100)} · {offer.duration_days} días</p>
          </li>)}
        </ul>
      ) : <p>No hay ofertas publicadas vigentes.</p>}
    </section>
  );
}
