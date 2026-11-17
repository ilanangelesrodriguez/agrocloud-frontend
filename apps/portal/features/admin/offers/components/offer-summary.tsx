"use client";

import type { Offer } from "../schema";
import Link from "next/link";
import { FiArchive, FiEdit3, FiUpload } from "react-icons/fi";
import { usePanelBusy } from "@/components/route-drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, Button, toast } from "@heroui/react";
import { StatusBadge, PageHeader, ErrorState } from "@agrocloud/ui";
import { saveOffer } from "../api";
import { stateLabels, kindLabels, listKey, offerTone } from "../labels";
import { money } from "../schema";

export function OfferSummary({ offer, reload }: { offer: Offer; reload: () => void }) {
  const cache = useQueryClient();
  const reportBusy = usePanelBusy();
  const { terms } = offer;
  const update = useMutation({
    mutationFn: (status: "PUBLISHED" | "ARCHIVED") =>
      saveOffer({ ...terms, status, version: offer.version }, offer.key),
    onMutate: () => reportBusy?.(true),
    onSettled: () => reportBusy?.(false),
    onSuccess: (result) => {
      cache.setQueryData([...listKey, offer.key], result);
      void cache.invalidateQueries({ queryKey: listKey });
      toast.success("Nueva versión registrada");
    },
    retry: false,
  });

  return (
    <section className="space-y-4">
      <PageHeader title={terms.name} />
      <h2 className="text-xl font-semibold">{terms.name}</h2>
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
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-accent hover:bg-default"
            href={"/admin/plans/" + offer.key + "/edit"}
          >
            <FiEdit3 aria-hidden="true" /> Editar oferta
          </Link>
          {offer.status === "DRAFT" ? (
            <Button
              isDisabled={update.isPending}
              variant="primary"
              onPress={() => update.mutate("PUBLISHED")}
            >
              <FiUpload aria-hidden="true" /> Publicar
            </Button>
          ) : null}
          <AlertDialog>
            <Button isDisabled={update.isPending} variant="danger-soft">
              <FiArchive aria-hidden="true" /> Archivar
            </Button>
            <AlertDialog.Backdrop>
              <AlertDialog.Container placement="center" size="sm">
                <AlertDialog.Dialog>
                  {({ close }) => (
                    <>
                      <AlertDialog.Header>
                        <AlertDialog.Icon status="warning" />
                        <AlertDialog.Heading>¿Archivar esta oferta?</AlertDialog.Heading>
                      </AlertDialog.Header>
                      <AlertDialog.Body>
                        Las órdenes existentes conservarán sus condiciones. La oferta dejará de
                        estar disponible para nuevas compras.
                      </AlertDialog.Body>
                      <AlertDialog.Footer>
                        <Button slot="close" variant="secondary">
                          Cancelar
                        </Button>
                        <Button
                          variant="danger"
                          onPress={() => {
                            close();
                            update.mutate("ARCHIVED");
                          }}
                        >
                          <FiArchive aria-hidden="true" /> Archivar oferta
                        </Button>
                      </AlertDialog.Footer>
                    </>
                  )}
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
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
