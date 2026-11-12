"use client";
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="site-container flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl text-danger">!</span>
      <h1 className="mt-5 text-3xl font-semibold">No se pudo cargar esta página</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">
        Ocurrió un problema temporal. Intenta nuevamente sin perder el contexto de tu navegación.
      </p>
      <button type="button" onClick={reset} className="site-button site-button-primary mt-7">
        Reintentar
      </button>
    </section>
  );
}
