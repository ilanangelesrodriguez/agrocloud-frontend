"use client";

import type { Offer } from "../schema";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, toast } from "@heroui/react";
import { StatusBadge, PageHeader, ErrorState } from "@agrocloud/ui";
import { saveOffer } from "../api";
import { stateLabels, kindLabels, linkClass, listKey, offerTone } from "../labels";
import { money } from "../schema";

export function OfferSummary({ offer, reload }: { offer: Offer; reload: () => void }) {
  const cache = useQueryClient();
  const { terms } = offer;
  const update = useMutation({
    mutationFn: (status: "PUBLISHED" | "ARCHIVED") =>
      saveOffer({ ...terms, status, version: offer.version }, offer.key),
    onSuccess: (result) => {
      cache.setQueryData([...listKey, offer.key], result);
      void cache.invalidateQueries({ queryKey: listKey });
      toast.success("Nueva versión registrada");
    },
    retry: false,
  });

  return (
    <section className="space-y-4">
      <Link className={linkClass} href="/admin/plans">
        Volver a ofertas
      </Link>
      <PageHeader title={terms.name} />
      <p>
        {offer.key} · {kindLabels[terms.kind]} ·{" "}
        <StatusBadge tone={offerTone(offer.status)}>{stateLabels[offer.status]}</StatusBadge> ·
        Versión {offer.version}
      </p>
      <dl className="grid gap-3 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
        {[
          ["Precio", money.format(terms.amount_cents / 100)],
          ["Descripción", terms.description],
          ["Plan asociado", terms.plan],
          ["Duración", terms.duration_days ? terms.duration_days + " días" : undefined],
          ["Usuarios", terms.limits?.usuarios],
          ["Lotes", terms.limits?.lotes],
          ["Análisis IA", terms.limits?.analisis_ia],
          ["Cantidad del complemento", terms.quantity],
          ["Visible en la web", terms.public ? "Sí" : "No"],
          ["Inicio de vigencia (UTC)", terms.valid_from],
          ["Fin de vigencia exclusivo (UTC)", terms.valid_until],
          ["Última versión registrada", offer.created_at],
          ["Responsable", offer.actor_id],
        ]
          .filter(([, value]) => value != null)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      {offer.status !== "ARCHIVED" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Link className={linkClass} href={"/admin/plans/" + offer.key + "/edit"}>
            Revisar oferta
          </Link>
          {offer.status === "DRAFT" ? (
            <Button
              isDisabled={update.isPending}
              variant="primary"
              onPress={() => update.mutate("PUBLISHED")}
            >
              Publicar
            </Button>
          ) : null}
          <Button
            isDisabled={update.isPending}
            variant="secondary"
            onPress={() => {
              if (
                window.confirm(
                  "¿Archivar la oferta? Las órdenes existentes conservan sus condiciones.",
                )
              )
                update.mutate("ARCHIVED");
            }}
          >
            Archivar
          </Button>
        </div>
      ) : null}
      {update.error ? (
        <ErrorState
          error={update.error}
          retry={() => {
            update.reset();
            reload();
          }}
        />
      ) : null}
    </section>
  );
}
