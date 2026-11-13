import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Panel de plataforma</h1>
      <nav aria-label="Administración global" className="grid gap-4 sm:grid-cols-2">
        <Link className="rounded-card border border-border bg-surface p-5 text-lg font-semibold text-accent underline" href="/admin/access-requests">
          Solicitudes empresariales
        </Link>
        <Link className="rounded-card border border-border bg-surface p-5 text-lg font-semibold text-accent underline" href="/admin/companies">
          Empresas registradas
        </Link>
      </nav>
    </section>
  );
}
