"use client";

import { FiPackage, FiPlus } from "react-icons/fi";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
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
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.data.map((offer) => (
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
              <p className="text-sm text-muted">
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
