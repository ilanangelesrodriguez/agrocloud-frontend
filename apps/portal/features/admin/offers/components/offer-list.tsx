"use client";

import { FiPackage, FiPlus } from "react-icons/fi";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { AdminFilterBar, matchesSearch } from "@/features/admin/components/admin-filter-bar";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { CreationDrawer } from "@/components/creation-drawer";
import { OfferForm } from "./offer-form";
import { EmptyState, LoadingState, PageHeader, StatusBadge, ErrorState } from "@agrocloud/ui";
import { useOffers } from "../hooks";
import { stateLabels, kindLabels, linkClass, offerTone } from "../labels";
import { money } from "../schema";

export function OfferList({ initialCreate = false }: { initialCreate?: boolean }) {
  const router = useRouter();
  const [creating, setCreating] = useState(initialCreate);
  const [saving, setSaving] = useState(false);
  function setOpen(open: boolean) {
    setCreating(open);
    if (!open && initialCreate) router.replace("/admin/plans");
  }
  const query = useOffers();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("");
  const rows = (query.data?.data ?? []).filter(
    (offer) =>
      matchesSearch([offer.terms.name, offer.key], search) &&
      (status === "all" || offer.status === status) &&
      (!kind || offer.terms.kind === kind),
  );

  return (
    <section className="space-y-4">
      <PageHeader
        title="Ofertas comerciales"
        description="Administra planes, vigencias y complementos disponibles."
        actions={
          <CreationDrawer
            open={creating}
            onOpenChange={setOpen}
            busy={saving}
            title="Crear oferta"
            description="Define el precio, las condiciones y la vigencia. La oferta se guardará como borrador."
            trigger={
              <Button variant="primary" onPress={() => setOpen(true)}>
                <FiPlus aria-hidden="true" /> Crear borrador
              </Button>
            }
          >
            <OfferForm onSaved={() => setOpen(false)} onBusyChange={setSaving} />
          </CreationDrawer>
        }
      />
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        scope="all"
        onClear={() => setKind("")}
        placeholder="Nombre o código de oferta"
        states={[
          { id: "all", label: "Todas" },
          { id: "DRAFT", label: "Borradores" },
          { id: "PUBLISHED", label: "Publicadas" },
          { id: "ARCHIVED", label: "Archivadas" },
        ]}
      >
        <CatalogSelect
          label="Tipo de oferta"
          value={kind}
          onChange={setKind}
          optional
          emptyLabel="Todos los tipos"
          items={Object.entries(kindLabels).map(([id, name]) => ({ id, name }))}
        />
      </AdminFilterBar>
      {query.isPending ? (
        <LoadingState label="Cargando ofertas" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : rows.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((offer) => (
            <li
              key={offer.key}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link
                className={`${linkClass} text-lg font-semibold`}
                href={"/admin/plans/" + offer.key}
              >
                <span className="inline-flex items-center gap-2">
                  <FiPackage aria-hidden="true" className="shrink-0 text-accent" />
                  {offer.terms.name}
                </span>
              </Link>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge tone={offerTone(offer.status)}>
                  {stateLabels[offer.status]}
                </StatusBadge>
                <span className="text-xs text-muted">{kindLabels[offer.terms.kind]}</span>
              </div>
              <p className="text-3xl font-semibold tabular-nums">
                {money.format(offer.terms.amount_cents / 100)}
              </p>
              <p className="text-xs text-muted">
                Versión {offer.version}
                {offer.terms.duration_days ? " · " + offer.terms.duration_days + " días" : ""}
              </p>
              {offer.terms.limits ? (
                <dl className="space-y-2 border-t border-border pt-3 text-sm">
                  {Object.entries(offer.terms.limits).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3">
                      <dt className="text-muted">
                        {
                          { usuarios: "Usuarios", lotes: "Lotes", analisis_ia: "Análisis IA" }[
                            key as "usuarios" | "lotes" | "analisis_ia"
                          ]
                        }
                      </dt>
                      <dd className="font-medium tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : offer.terms.quantity ? (
                <p className="text-sm text-muted">
                  Cantidad del complemento: {offer.terms.quantity}
                </p>
              ) : null}
              <Link
                className="mt-auto inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-accent"
                href={"/admin/plans/" + offer.key}
              >
                {offer.status === "ARCHIVED" ? "Consultar oferta archivada" : "Ver oferta"}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Sin ofertas para esta vista"
          description="Cambia los filtros o crea un borrador si todavía no hay ofertas."
        />
      )}
    </section>
  );
}
