"use client";

import { useState } from "react";
import type { Offer } from "../schema";
import Link from "next/link";
import { FiArchive, FiEdit3, FiUpload } from "react-icons/fi";
import { usePanelBusy } from "@/components/route-drawer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, Button, Table, toast } from "@heroui/react";
import { StatusBadge, PageHeader, ErrorState, FormNotice } from "@agrocloud/ui";
import { getOfferHistory, saveOffer } from "../api";
import { stateLabels, kindLabels, listKey, offerTone } from "../labels";
import { money } from "../schema";

export function OfferSummary({
  offer,
  published,
  reload,
}: {
  offer: Offer;
  published?: Offer | null;
  reload: () => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const history = useQuery({
    queryKey: [...listKey, offer.key, "versions"],
    queryFn: ({ signal }) => getOfferHistory(offer.key, signal),
    enabled: historyOpen,
    retry: false,
  });
  const cache = useQueryClient();
  const [publishing, setPublishing] = useState(false);
  const reportBusy = usePanelBusy();
  const { terms } = offer;
  const update = useMutation({
    mutationFn: (status: "PUBLISHED" | "ARCHIVED") =>
      saveOffer({ ...terms, status, version: offer.version }, offer.key),
    onMutate: () => reportBusy?.(true),
    onSettled: () => reportBusy?.(false),
    onSuccess: (result) => {
      setPublishing(false);
      cache.setQueryData([...listKey, offer.key], result);
      void cache.invalidateQueries({ queryKey: listKey });
      toast.success("Nueva versión registrada");
    },
    retry: false,
  });

  return (
    <section className="space-y-4">
      <PageHeader title={terms.name} />
      <div className="space-y-2 rounded-2xl border border-border bg-surface p-5">
        <p className="text-3xl font-semibold tabular-nums">
          {money.format(terms.amount_cents / 100)}
          {terms.duration_days ? (
            <span className="ml-2 text-sm font-normal text-muted">
              por {terms.duration_days} días
            </span>
          ) : null}
        </p>
        <p className="text-xs text-muted">
          {offer.status === "DRAFT"
            ? published
              ? "Versión de trabajo. La versión publicada " +
                published.version +
                " conserva su precio de " +
                money.format(published.terms.amount_cents / 100) +
                " hasta confirmar la sustitución."
              : "Versión de trabajo pendiente de publicación."
            : offer.status === "PUBLISHED"
              ? terms.public
                ? "Oferta publicada · Visible en la web cuando esté vigente"
                : "Oferta publicada · Solo portal privado"
              : "Oferta archivada · Retirada de nuevas compras"}
        </p>
      </div>
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
            <FiEdit3 aria-hidden="true" />{" "}
            {offer.status === "PUBLISHED" ? "Preparar nueva versión" : "Editar borrador"}
          </Link>
          {offer.status === "DRAFT" ? (
            <AlertDialog
              isOpen={publishing}
              onOpenChange={(open) => {
                if (!update.isPending) setPublishing(open);
              }}
            >
              <Button
                isDisabled={update.isPending}
                variant="primary"
                onPress={() => setPublishing(true)}
              >
                <FiUpload aria-hidden="true" /> Publicar oferta
              </Button>
              <AlertDialog.Backdrop
                isDismissable={!update.isPending}
                isKeyboardDismissDisabled={update.isPending}
              >
                <AlertDialog.Container placement="center" size="sm">
                  <AlertDialog.Dialog>
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="accent" />
                      <AlertDialog.Heading>¿Publicar esta oferta?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <p className="font-semibold">
                        {terms.name} · {money.format(terms.amount_cents / 100)}
                      </p>
                      <p className="mt-3 text-sm text-muted">
                        Se registrará una nueva versión publicada con estas condiciones. Su
                        disponibilidad para compra respetará la visibilidad, la vigencia y las
                        reglas de Billing.
                      </p>
                      {update.error ? <FormNotice message={update.error.message} /> : null}
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button slot="close" variant="secondary" isDisabled={update.isPending}>
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        isPending={update.isPending}
                        onPress={() => {
                          if (!update.isPending) update.mutate("PUBLISHED");
                        }}
                      >
                        Confirmar publicación
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
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
      <details
        className="rounded-2xl border border-border bg-surface p-5"
        onToggle={(event) => setHistoryOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer font-semibold">Historial de versiones</summary>
        <div className="mt-4">
          {history.isPending ? (
            <p className="text-sm text-muted">Cargando versiones…</p>
          ) : history.isError ? (
            <ErrorState error={history.error} retry={() => history.refetch()} />
          ) : history.data ? (
            <>
              <p className="mb-3 text-xs text-muted">
                {history.data.published
                  ? "Versión comercial vigente: " + history.data.published.version
                  : "Sin versión publicada vigente."}{" "}
                Las órdenes existentes mantienen las condiciones con las que se crearon.
              </p>
              <Table>
                <Table.ScrollContainer>
                  <Table.Content
                    aria-label="Historial de versiones de la oferta"
                    className="min-w-[600px]"
                  >
                    <Table.Header>
                      <Table.Column isRowHeader>Versión</Table.Column>
                      <Table.Column>Estado</Table.Column>
                      <Table.Column>Precio</Table.Column>
                      <Table.Column>Fecha</Table.Column>
                      <Table.Column>Responsable</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {history.data.data.map((record) => (
                        <Table.Row key={record.version} id={record.version}>
                          <Table.Cell>
                            v{record.version}
                            {history.data.published?.version === record.version ? " · Vigente" : ""}
                          </Table.Cell>
                          <Table.Cell>{stateLabels[record.status]}</Table.Cell>
                          <Table.Cell>{money.format(record.terms.amount_cents / 100)}</Table.Cell>
                          <Table.Cell>{displayOfferDate(record.created_at)}</Table.Cell>
                          <Table.Cell>
                            {record.actor_id ? "Usuario #" + record.actor_id : "Sin dato"}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </>
          ) : null}
        </div>
      </details>
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

function displayOfferDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-PE", { timeZone: "America/Lima" });
}
