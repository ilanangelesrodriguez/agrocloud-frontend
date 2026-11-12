import Link from "next/link";
export default function NotFound() {
  return (
    <section className="site-container flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-mono text-6xl font-bold text-accent">404</span>
      <h1 className="mt-5 text-3xl font-semibold">No encontramos esta página</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">
        Es posible que el enlace haya cambiado. Puedes volver al inicio y continuar navegando.
      </p>
      <Link href="/" className="site-button site-button-primary mt-7">
        Volver al inicio
      </Link>
    </section>
  );
}
