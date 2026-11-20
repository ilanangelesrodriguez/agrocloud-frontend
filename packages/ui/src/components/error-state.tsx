"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@heroui/react";

export type ErrorStateProps = {
  error: unknown;
  retry?: () => unknown | Promise<unknown>;
  title?: string;
  description?: string;
  actions?: ReactNode;
  size?: "page" | "compact";
  className?: string;
};

/** API, red o errores inesperados: reserva el espacio del contenido y permite recuperarse. */
export function ErrorState({
  error,
  retry,
  title,
  description,
  actions,
  size = "page",
  className = "",
}: ErrorStateProps) {
  const [retrying, setRetrying] = useState(false);
  const status =
    error && typeof error === "object" && "status" in error ? Number(error.status) : undefined;
  const message =
    typeof error === "string"
      ? error
      : error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : "";
  const titles: Record<number, string> = {
    401: "Tu sesión necesita renovarse",
    403: "No tienes acceso a esta información",
    404: "No encontramos este registro",
    429: "Espera un momento para continuar",
  };
  const safeMessage =
    message &&
    !/fetch failed|failed to fetch|networkerror|unexpected token|stack|<html|<!doctype/i.test(
      message,
    )
      ? message.slice(0, 500)
      : "No pudimos completar la solicitud. Revisa tu conexión e inténtalo de nuevo.";
  async function handleRetry() {
    if (!retry || retrying) return;
    setRetrying(true);
    try {
      await retry();
    } catch {
      /* El propietario conserva y presenta el error de la consulta. */
    } finally {
      setRetrying(false);
    }
  }

  return (
    <section
      role="alert"
      aria-live="polite"
      aria-busy={retrying}
      className={`flex ${size === "compact" ? "min-h-48" : "min-h-96"} w-full flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-10 text-center ${className}`.trim()}
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-6"
        >
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 7v6m0 4h.01" />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-foreground">
        {title || (status ? titles[status] : undefined) || "No se pudo cargar la información"}
      </h2>
      <p className="mt-2 max-w-lg break-words text-sm leading-relaxed text-muted">
        {description || safeMessage}
      </p>
      {retry || actions ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {retry ? (
            <Button variant="secondary" isDisabled={retrying} onPress={() => void handleRetry()}>
              {retrying ? "Reintentando…" : "Reintentar"}
            </Button>
          ) : null}
          {actions}
        </div>
      ) : null}
    </section>
  );
}
