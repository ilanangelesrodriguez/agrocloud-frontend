"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@heroui/react";
import { ErrorState, LoadingState } from "@agrocloud/ui";
import { bffRequest } from "@/lib/api/bff-client";
import { dashboardResponse } from "@/features/agricultural/operations-schema";
import { InspectorWorkDashboard } from "./inspector-work-dashboard";
export function WorkDashboard({ inspector = false }: { inspector?: boolean }) {
  const query = useQuery({
    queryKey: ["agricultural", "dashboard"],
    queryFn: ({ signal }) => bffRequest("dashboard", dashboardResponse, { signal }, "agricultural"),
    retry: false,
  });
  if (query.isPending)
    return inspector ? (
      <section role="status" aria-label="Cargando actividades pendientes" className="space-y-5">
        <span className="sr-only">Cargando actividades pendientes</span>
        <div aria-hidden="true" className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-48 rounded-2xl" />
          ))}
        </div>
        <Skeleton aria-hidden="true" className="h-24 rounded-2xl" />
        <Skeleton aria-hidden="true" className="h-56 rounded-2xl" />
      </section>
    ) : (
      <LoadingState label="Cargando actividades pendientes" />
    );
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  if (inspector)
    return <InspectorWorkDashboard data={query.data} updatedAt={query.dataUpdatedAt} />;
  return (
    <section className="space-y-5" aria-label="Bandeja de trabajo">
      <h2 className="text-xl font-semibold">Tu trabajo pendiente</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {query.data.metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="rounded-card border border-border bg-surface p-5"
          >
            <p className="text-sm text-muted">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
          </Link>
        ))}
      </div>
      <h3 className="font-semibold">Actividades que requieren atención</h3>
      {query.data.tasks.length ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {query.data.tasks.map((task) => (
            <li key={task.href + task.label}>
              <Link href={task.href} className="block p-4 text-accent">
                {task.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No tienes actividades pendientes en esta bandeja.</p>
      )}
    </section>
  );
}
