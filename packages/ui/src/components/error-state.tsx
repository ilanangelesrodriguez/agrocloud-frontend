"use client";

import { Button } from "@heroui/react";

import { InlineNotice } from "./inline-notice";

type ErrorStateProps = {
  error: Error | string;
  retry?: () => void;
  title?: string;
  className?: string;
};

/** Mensaje persistente de error. Los detalles técnicos no se exponen aquí. */
export function ErrorState({
  error,
  retry,
  title = "No se pudo cargar la información",
  className = "",
}: ErrorStateProps) {
  const message = typeof error === "string" ? error : error.message;

  return (
    <div className={`grid gap-3 ${className}`.trim()} role="alert">
      <InlineNotice
        description={message || "Ocurrió un error inesperado."}
        status="danger"
        title={title}
      />
      {retry ? (
        <div>
          <Button size="sm" variant="secondary" onPress={retry}>
            Reintentar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
