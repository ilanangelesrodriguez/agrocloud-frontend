"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { ErrorState, InlineNotice, LoadingState } from "@agrocloud/ui";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function AdminGate({ children }: { children: ReactNode }) {
  const user = useCurrentUser();

  if (user.isPending) {
    return <LoadingState label="Verificando permisos de administración" variant="spinner" />;
  }

  if (user.isError) {
    return <ErrorState error={user.error} retry={() => void user.refetch()} />;
  }

  if (user.data?.rol?.codigo !== "SUPERADMIN") {
    return (
      <div className="grid gap-3">
        <InlineNotice
          description="Esta sección solo está disponible para administradores globales."
          status="warning"
          title="Acceso restringido"
        />
        <div>
          <Link
            className="inline-flex min-h-10 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-accent hover:bg-surface-secondary"
            href="/dashboard"
          >
            Ir al panel empresarial
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
