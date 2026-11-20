"use client";

import Link from "next/link";
import { ErrorState } from "@agrocloud/ui";

/** Recuperación común para errores de renderizado en las rutas operativas. */
export function OperationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      title="No pudimos mostrar esta vista"
      description="Ocurrió un problema al abrir este paso. Intenta cargarlo de nuevo o vuelve al listado para continuar."
      retry={reset}
      actions={
        <Link
          href="/lots"
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-accent"
        >
          Volver a lotes
        </Link>
      }
    />
  );
}
