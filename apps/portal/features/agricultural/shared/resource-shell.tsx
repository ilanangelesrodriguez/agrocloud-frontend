"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { InlineNotice, LoadingState, PageHeader } from "@agrocloud/ui";

export function ResourceShell({
  title,
  base,
  mode,
  canRead,
  canCreate,
  allowed,
  isPending,
  children,
}: {
  title: string;
  base: "/producers" | "/lots";
  mode: "list" | "new" | "detail" | "edit";
  canRead: boolean;
  canCreate: boolean;
  allowed: boolean;
  isPending: boolean;
  children: ReactNode;
}) {
  if (isPending) return <LoadingState label="Verificando permisos" variant="spinner" />;
  if (!allowed) {
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="No tienes permiso para esta operación."
      />
    );
  }

  return (
    <section className="space-y-5">
      <PageHeader title={title} />
      <nav aria-label={title} className="flex flex-wrap gap-4">
        <Link className="font-semibold text-accent underline" href="/dashboard">
          Panel empresarial
        </Link>
        {canRead && mode !== "list" ? (
          <Link className="font-semibold text-accent underline" href={base}>
            Volver al listado
          </Link>
        ) : null}
        {canCreate && mode === "list" ? (
          <Link className="font-semibold text-accent underline" href={base + "/new"}>
            Registrar {base === "/lots" ? "lote" : "productor"}
          </Link>
        ) : null}
      </nav>
      {children}
    </section>
  );
}
