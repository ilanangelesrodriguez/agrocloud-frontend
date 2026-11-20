"use client";
import Link from "next/link";
import { setupSchema } from "../schema";
import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState, StatusBadge } from "@agrocloud/ui";
import { bffRequest } from "@/lib/api/bff-client";
export function SetupChecklist() {
  const query = useQuery({
    queryKey: ["agricultural", "setup"],
    queryFn: ({ signal }) => bffRequest("setup", setupSchema, { signal }, "agricultural"),
    staleTime: 60000,
    retry: false,
  });
  if (query.isPending) return <LoadingState label="Consultando preparación agrícola" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const completed = query.data.checks.filter((item) => item.done).length;
  return (
    <section className="space-y-4 rounded-card border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">
        Preparación agrícola · {completed} de {query.data.checks.length}
      </h2>
      <progress
        aria-label="Configuración agrícola completada"
        value={completed}
        max={query.data.checks.length}
        className="w-full"
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {query.data.checks.map((item) => (
          <li key={item.key} className="flex justify-between gap-3">
            <Link href={item.href} className="text-accent">
              {item.label}
            </Link>
            <StatusBadge tone={item.done ? "success" : "neutral"}>
              {item.done ? "Listo" : "Pendiente"}
            </StatusBadge>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-4 border-t border-border pt-3">
        <Link href="/settings/company" className="text-accent">
          Revisar información de la empresa
        </Link>
        <Link href="/settings/users" className="text-accent">
          Configurar equipo operativo
        </Link>
      </div>
    </section>
  );
}
