"use client";

import { Button } from "@heroui/react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="site-container flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <FiAlertTriangle aria-hidden="true" className="size-12 text-danger" />
      <h1 className="mt-5 text-3xl font-semibold">No se pudo cargar esta página</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">
        Ocurrió un problema temporal. Intenta nuevamente sin perder el contexto de tu navegación.
      </p>
      <Button className="mt-7" size="lg" variant="primary" onPress={reset}>
        <FiRefreshCw aria-hidden="true" className="size-4" />
        Reintentar
      </Button>
    </section>
  );
}
