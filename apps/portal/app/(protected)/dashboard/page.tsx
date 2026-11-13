"use client";

import Link from "next/link";
import { InlineNotice, LoadingState, MetricCard, PageHeader } from "@agrocloud/ui";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany, settingsLinks } from "@/features/company/navigation";

export default function DashboardPage() {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) {
    return <LoadingState label="Cargando el panel empresarial" lines={4} />;
  }

  if (!user) return null;

  if (user.rol?.codigo === "SUPERADMIN") {
    return (
      <div className="grid gap-3">
        <InlineNotice
          description="El administrador global utiliza un panel de plataforma independiente."
          status="warning"
          title="Estás en el panel empresarial"
        />
        <Link className="font-medium text-accent underline" href="/admin">
          Ir al panel de plataforma
        </Link>
      </div>
    );
  }

  const links = [
    { href: "/producers", label: "Productores", permission: "productores.ver" },
    { href: "/lots", label: "Lotes", permission: "lotes.ver" },
    ...settingsLinks,
  ].filter(({ permission }) => canManageCompany(user, permission));

  return (
    <section className="space-y-7">
      <PageHeader
        description="Accede a las operaciones y configuraciones autorizadas para tu empresa."
        title={`Bienvenido, ${user.nombre}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard title="Empresa asignada" value={user.id_empresa ?? "Sin asignar"} />
        <MetricCard title="Rol actual" value={user.rol?.nombre ?? user.rol?.codigo ?? "Sin rol"} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Accesos disponibles</h2>
        <nav aria-label="Gestión empresarial" className="flex flex-wrap gap-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              className="inline-flex min-h-10 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-accent hover:bg-surface-secondary"
              href={href}
            >
              {label}
            </Link>
          ))}
          <Link
            className="inline-flex min-h-10 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-accent hover:bg-surface-secondary"
            href="/settings/profile"
          >
            Mi cuenta
          </Link>
        </nav>
      </div>
    </section>
  );
}
