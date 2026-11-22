"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { ErrorState, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { navigationFor } from "@/config/navigation";
import { getCompanySubscription } from "@/features/company/subscription/api";
import { WorkDashboard } from "./work-dashboard";
import { SetupChecklist } from "./setup-checklist";
export function OperationalDashboard() {
  const session = useCurrentUser();
  const user = session.data;
  const router = useRouter();
  const cache = useQueryClient();
  const refreshing = useIsFetching({ queryKey: ["agricultural", "dashboard"] }) > 0;
  const subscription = useQuery({
    queryKey: ["company", "subscription"],
    queryFn: ({ signal }) => getCompanySubscription(signal),
    enabled: canManageCompany(user, "suscripciones.ver"),
    staleTime: 60000,
    retry: false,
  });
  useEffect(() => {
    if (user?.rol?.codigo === "SUPERADMIN") router.replace("/admin");
  }, [user?.rol?.codigo, router]);
  if (session.isPending) return <LoadingState label="Cargando panel" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;
  if (!user || user.rol?.codigo === "SUPERADMIN")
    return <LoadingState label="Abriendo plataforma" />;
  const links =
    navigationFor(user)
      .find((section) => section.title === "Operaciones")
      ?.items.filter((item) => item.href !== "/dashboard") ?? [];
  return (
    <section className="space-y-6">
      <PageHeader
        title={
          user.rol?.codigo === "INSPECTOR"
            ? "Mi jornada de inspección"
            : `Panel principal · ${user.rol?.nombre ?? user.rol?.codigo ?? "Empresa"}`
        }
        description={
          user.rol?.codigo === "INSPECTOR"
            ? "Revisa los pendientes del equipo, continúa tus inspecciones y atiende los análisis que requieren revisión."
            : "Tus pendientes y accesos según las responsabilidades de tu cuenta."
        }
        actions={
          <Button
            isPending={refreshing}
            onPress={() => void cache.invalidateQueries({ queryKey: ["agricultural"] })}
          >
            Actualizar
          </Button>
        }
      />
      <WorkDashboard inspector={user.rol?.codigo === "INSPECTOR"} />
      {user.rol?.codigo === "ADMIN" && canManageCompany(user, "empresa.editar") ? (
        <SetupChecklist />
      ) : null}
      <nav aria-label="Accesos operativos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-card border border-border bg-surface p-5 font-medium text-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {canManageCompany(user, "suscripciones.ver") ? (
        <section className="space-y-3 rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">Suscripción y consumo</h2>
          {subscription.isPending ? (
            <LoadingState label="Consultando cupos" />
          ) : subscription.isError ? (
            <ErrorState error={subscription.error} retry={() => subscription.refetch()} />
          ) : (
            <>
              <p>
                {subscription.data.subscription?.plan ?? "Sin plan"} ·{" "}
                {subscription.data.active ? "Activo" : "Requiere atención"}
              </p>
              {subscription.data.rights.map((right) => (
                <p key={right.recurso}>
                  {(
                    { usuarios: "Usuarios", lotes: "Lotes", analisis_ia: "Análisis IA" } as Record<
                      string,
                      string
                    >
                  )[right.recurso] ?? right.recurso}
                  : {right.consumido} / {right.limite}
                </p>
              ))}
            </>
          )}
          <Link href="/settings/subscription" className="inline-block text-accent">
            Gestionar suscripción
          </Link>
        </section>
      ) : null}
    </section>
  );
}
