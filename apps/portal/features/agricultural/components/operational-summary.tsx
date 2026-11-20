"use client";
import { useQuery } from "@tanstack/react-query";
import { LoadingState, ErrorState } from "@agrocloud/ui";
import { bffRequest } from "@/lib/api/bff-client";
import { reportSummary } from "../operations-schema";

export function OperationalSummary() {
  const query = useQuery({
    queryKey: ["agricultural", "reports"],
    queryFn: ({ signal }) =>
      bffRequest("reports/summary", reportSummary, { signal }, "agricultural"),
  });
  if (query.isPending) return <LoadingState label="Cargando indicadores" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const groups: [string, { estado: string; total: number }[]][] = [
    ["Lotes por estado", query.data.lots_by_status],
    ["Inspecciones por estado", query.data.inspections_by_status],
  ];
  return (
    <div className="space-y-5">
      <p className="rounded-card border border-border bg-surface p-5">
        Incidencias altas o críticas pendientes de cierre:{" "}
        <strong>{query.data.open_critical_incidents}</strong>
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {groups.map(([title, rows]) => (
          <section key={String(title)} className="rounded-card border border-border bg-surface p-5">
            <h2 className="mb-3 font-semibold">{String(title)}</h2>
            <dl className="space-y-2">
              {rows.map((row) => (
                <div key={row.estado} className="flex justify-between gap-4">
                  <dt>{row.estado.replaceAll("_", " ")}</dt>
                  <dd className="font-semibold">{row.total}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
