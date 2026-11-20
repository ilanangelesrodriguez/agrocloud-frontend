"use client";

import type { ReactNode } from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import { CreationDrawer } from "@/components/creation-drawer";
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
  createForm,
}: {
  title: string;
  base: "/producers" | "/lots";
  mode: "list" | "new" | "detail" | "edit";
  canRead: boolean;
  canCreate: boolean;
  allowed: boolean;
  isPending: boolean;
  children: ReactNode;
  createForm?: (onSaved: () => void, onBusyChange: (busy: boolean) => void) => ReactNode;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(mode === "new");
  const [saving, setSaving] = useState(false);
  function setOpen(open: boolean) {
    setCreating(open);
    if (!open && mode === "new") router.replace(base);
  }

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
      <PageHeader
        title={title}
        description={
          base === "/lots"
            ? "Organiza tus lotes y consulta su avance en cada etapa."
            : "Administra los productores y sus datos de identificación y ubicación."
        }
        actions={
          canCreate && (mode === "list" || mode === "new") && createForm ? (
            <CreationDrawer
              open={creating}
              onOpenChange={setOpen}
              busy={saving}
              title={base === "/lots" ? "Registrar lote" : "Registrar productor"}
              description={
                base === "/lots"
                  ? "Asocia el productor, completa los datos del producto y programa su llegada."
                  : "Completa la identificación del productor y la ubicación de su operación."
              }
              trigger={
                <Button variant="primary" onPress={() => setOpen(true)}>
                  <FiPlus aria-hidden="true" /> Registrar {base === "/lots" ? "lote" : "productor"}
                </Button>
              }
            >
              {createForm(() => setOpen(false), setSaving)}
            </CreationDrawer>
          ) : undefined
        }
      />
      {mode === "detail" || mode === "edit" ? (
        <nav aria-label={title} className="flex flex-wrap gap-4">
          <Link
            className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-muted transition-colors hover:bg-default hover:text-foreground"
            href="/dashboard"
          >
            Panel empresarial
          </Link>
          {canRead ? (
            <Link
              className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-muted transition-colors hover:bg-default hover:text-foreground"
              href={base}
            >
              Volver al listado
            </Link>
          ) : null}
        </nav>
      ) : null}
      {children}
    </section>
  );
}
