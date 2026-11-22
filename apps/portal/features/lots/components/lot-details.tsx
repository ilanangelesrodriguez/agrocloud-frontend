"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs } from "@heroui/react";
import { LoadingState, ErrorState, PageHeader, StatusBadge } from "@agrocloud/ui";
import { useLotDetails } from "../hooks";
import { LotManagement } from "@/features/agricultural/components/lot-management";
import { Traceability } from "@/features/traceability/components/traceability";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { LotOperations } from "./lot-operations";
import { LotWorkflow } from "./lot-workflow";
type View = "overview" | "traceability" | "incidents";
function lotDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Lima",
      }).format(date);
}
export function LotDetails({
  id,
  stage = "overview",
}: {
  id: string;
  stage?: "overview" | "reception" | "sampling";
}) {
  const query = useLotDetails(id);
  const { data: actor } = useCurrentUser();
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  useEffect(() => {
    function restore() {
      setView(
        ["#traceability", "#lot-traceability"].includes(window.location.hash)
          ? "traceability"
          : window.location.hash === "#incidents"
            ? "incidents"
            : "overview",
      );
    }
    restore();
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
    };
  }, [id, stage]);
  if (query.isPending) return <LoadingState label="Cargando expediente del lote" />;
  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        retry={() => query.refetch()}
        actions={
          <Link
            href="/lots"
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-accent"
          >
            Volver a lotes
          </Link>
        }
      />
    );
  const lot = query.data.lot;
  const canTrace = canManageCompany(actor, "trazabilidad.ver");
  const canIncidents = canManageCompany(actor, "incidencias.ver");
  const current =
    stage !== "overview"
      ? stage
      : view === "traceability" && canTrace
        ? view
        : view === "incidents" && canIncidents
          ? view
          : "overview";
  const fields = [
    ["Producto", lot.producto],
    ["Variedad", lot.variedad],
    ["Peso", lot.peso_kg + " " + lot.unidad_medida],
    ["Productor", lot.productor?.nombre_razon_social ?? "Productor #" + lot.id_productor],
    ["Llegada prevista (hora de Perú)", lotDate(lot.fecha_llegada_prevista)],
    ["Estado", lot.estado.replaceAll("_", " ")],
  ];
  function select(key: string) {
    if (key === "reception" || key === "sampling") {
      router.push("/lots/" + id + "/" + key);
      return;
    }
    const next: View =
      key === "traceability" ? "traceability" : key === "incidents" ? "incidents" : "overview";
    if (stage !== "overview") {
      router.push("/lots/" + id + (next === "overview" ? "" : "#" + next));
      return;
    }
    setView(next);
    window.history.replaceState(
      window.history.state,
      "",
      "/lots/" + id + (next === "overview" ? "" : "#" + next),
    );
  }
  return (
    <div className="space-y-5">
      <PageHeader
        title={lot.codigo_lote}
        description={[lot.producto, lot.variedad, lot.productor?.nombre_razon_social]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              tone={
                lot.estado === "RECIBIDO"
                  ? "success"
                  : lot.estado === "PENDIENTE_RECEPCION"
                    ? "warning"
                    : "neutral"
              }
            >
              {lot.estado.replaceAll("_", " ")}
            </StatusBadge>
            <Link
              href="/lots"
              className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium"
            >
              Volver a lotes
            </Link>
          </div>
        }
      />
      {stage === "overview" ? (
        <LotWorkflow lot={lot} onOpenIncidents={() => select("incidents")} />
      ) : null}
      <Tabs
        variant="secondary"
        selectedKey={current}
        onSelectionChange={(key) => select(String(key))}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Vistas del expediente">
            <Tabs.Tab id="overview">
              Resumen
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="reception">
              Recepción
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="sampling">
              Muestreo
              <Tabs.Indicator />
            </Tabs.Tab>
            {canTrace ? (
              <Tabs.Tab id="traceability">
                Trazabilidad
                <Tabs.Indicator />
              </Tabs.Tab>
            ) : null}
            {canIncidents ? (
              <Tabs.Tab id="incidents">
                Incidencias
                <Tabs.Indicator />
              </Tabs.Tab>
            ) : null}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
      {current === "overview" ? (
        <>
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="font-semibold">Información del lote</h2>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium">
                    {value ?? "Sin información registrada"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <LotManagement lot={lot} view="actions" />
        </>
      ) : null}
      {stage !== "overview" ? <LotOperations lot={lot} stage={stage} /> : null}
      {current === "traceability" && canTrace ? <Traceability key={id} id={lot.id_lote} /> : null}
      {current === "incidents" && canIncidents ? (
        <LotManagement key={id} lot={lot} view="incidents" />
      ) : null}
    </div>
  );
}
