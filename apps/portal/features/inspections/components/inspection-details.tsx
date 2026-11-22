"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Chip, Tabs } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { InlineNotice, LoadingState, PageHeader, ErrorState } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { InspectionEvidence } from "@/features/evidences/components/inspection-evidence";
import { useInspectionDetails } from "../hooks";
import { useLotDetails } from "@/features/lots/hooks";
import { inspectionReviewStats } from "../review-progress";
import { OperationNavigation } from "@/features/agricultural/shared/operation-navigation";
import { InspectionClosure } from "./inspection-closure";
export function InspectionDetails({
  id,
  view = "overview",
}: {
  id: string;
  view?: "overview" | "evidences";
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState("overview");
  const session = useCurrentUser();
  const actor = session.data;
  const inspection = useInspectionDetails(id, canManageCompany(actor, "inspecciones.ver"));
  const value = inspection.data?.data;
  const lotId = value?.muestreo?.id_lote;
  const lotProgress = useLotDetails(
    String(lotId ?? ""),
    !!lotId && canManageCompany(actor, "lotes.ver"),
  );
  const flow = lotProgress.data?.lot.workflow;
  const progress =
    !lotProgress.isFetching && !lotProgress.isError && flow?.inspectionId === value?.id_inspeccion
      ? (flow?.evidenceProgress ?? undefined)
      : undefined;
  const stats = value ? inspectionReviewStats(value, progress) : undefined;
  useEffect(() => {
    function restore() {
      setTab(
        window.location.hash === "#validation"
          ? "validation"
          : window.location.hash === "#decision"
            ? "decision"
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
  }, [id, view]);
  function select(key: string) {
    if (key === "evidences") {
      router.push("/inspections/" + id + "/evidences");
      return;
    }
    if (view === "evidences") {
      router.push("/inspections/" + id + (key === "overview" ? "" : "#" + key));
      return;
    }
    setTab(key);
    window.history.replaceState(
      window.history.state,
      "",
      "/inspections/" + id + (key === "overview" ? "" : "#" + key),
    );
  }
  if (session.isPending) return <LoadingState label="Verificando acceso a la inspección" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;
  if (actor && !canManageCompany(actor, "inspecciones.ver"))
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="No tienes permiso para consultar inspecciones."
      />
    );
  return (
    <motion.section
      className="space-y-5"
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.15 }}
    >
      <PageHeader
        title={"Inspección #" + id}
        description={
          value
            ? [
                value.muestreo?.lote?.codigo_lote ??
                  (lotId ? "Lote #" + lotId : "Lote no disponible"),
                "Muestreo #" + value.id_muestreo,
              ].join(" · ")
            : "Revisión de evidencias y preparación para dictamen."
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {value ? (
              <Chip
                size="sm"
                variant="soft"
                color={value.estado === "VALIDADA" ? "success" : "accent"}
              >
                {value.estado.replaceAll("_", " ").toLocaleLowerCase("es")}
              </Chip>
            ) : null}
            <Link
              href={
                value && canManageCompany(actor, "muestreos.ver")
                  ? "/samplings/" + value.id_muestreo
                  : "/inspections"
              }
              className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium"
            >
              {value && canManageCompany(actor, "muestreos.ver")
                ? "Volver al muestreo"
                : "Volver a inspecciones"}
            </Link>
          </div>
        }
      />
      {inspection.isPending ? (
        <LoadingState label="Cargando inspección" />
      ) : inspection.isError ? (
        <ErrorState error={inspection.error} retry={() => inspection.refetch()} />
      ) : value && stats ? (
        <>
          <OperationNavigation
            lotId={lotId}
            samplingId={value.id_muestreo}
            inspectionId={id}
            current={view === "evidences" ? "evidence" : "inspection"}
            canReadLot={canManageCompany(actor, "lotes.ver")}
            canReadSampling={canManageCompany(actor, "muestreos.ver")}
            canReadInspection={canManageCompany(actor, "inspecciones.ver")}
          />
          <Tabs
            variant="secondary"
            selectedKey={view === "evidences" ? "evidences" : tab}
            onSelectionChange={(key) => select(String(key))}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Vistas de la inspección">
                {[
                  ["overview", "Resumen"],
                  ["evidences", "Evidencias"],
                  ["validation", "Validación"],
                  ["decision", "Dictamen"],
                ].map(([key, label]) => (
                  <Tabs.Tab key={key} id={key}>
                    {label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          {view === "overview" && tab === "overview" ? (
            <>
              <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Revisión de evidencias</h2>
                  <span className="text-xs text-muted">
                    {value.id_inspector
                      ? "Inspector #" + value.id_inspector
                      : "Sin inspector asignado"}
                  </span>
                </div>
                <p className="text-2xl font-semibold tabular-nums">
                  {stats.reviewed === undefined
                    ? "Vigencia sin verificar"
                    : stats.reviewed + " de " + stats.relevant}
                  <span className="ml-2 text-sm font-normal text-muted">
                    {stats.reviewed === undefined ? "" : "evidencias con revisión vigente"}
                  </span>
                </p>
                {stats.reviewed !== undefined && stats.relevant > 0 ? (
                  <progress
                    className="h-2 w-full accent-accent"
                    aria-label="Evidencias con revisión humana vigente"
                    value={stats.reviewed}
                    max={stats.relevant}
                  />
                ) : null}
                <p className="text-sm text-muted">
                  {value.estado === "VALIDADA"
                    ? "La inspección fue validada. Consulta el dictamen de calidad."
                    : stats.ready
                      ? "El servicio confirma la revisión completa. Puedes continuar a validación si tienes autorización."
                      : "Completa la cobertura de los frutos y la revisión humana vigente antes de validar."}
                </p>
                <dl className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Evidencias registradas", stats.registered],
                    ["No descartadas", stats.relevant],
                    ["Descartadas (historial)", stats.discarded],
                    ["Frutos cubiertos", stats.covered + " de " + (stats.total ?? "—")],
                  ].map(([label, count]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted">{label}</dt>
                      <dd className="mt-1 text-lg font-semibold tabular-nums">{count}</dd>
                    </div>
                  ))}
                </dl>
                {!stats.verified && value.estado === "EN_CAPTURA" ? (
                  <p className="text-xs text-muted">
                    {lotProgress.isFetching
                      ? "Consultando la vigencia de las revisiones…"
                      : "La vigencia no está disponible para esta inspección mediante el flujo del lote. Las revisiones guardadas no equivalen a revisiones vigentes."}
                  </p>
                ) : null}
                <Button
                  size="sm"
                  variant="secondary"
                  isPending={inspection.isFetching || lotProgress.isFetching}
                  onPress={() => {
                    void inspection.refetch();
                    if (lotId && canManageCompany(actor, "lotes.ver")) void lotProgress.refetch();
                  }}
                >
                  Actualizar progreso
                </Button>
              </section>
              <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/25 bg-accent/5 p-5">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Siguiente actividad
                  </h2>
                  <p className="mt-2 font-medium">
                    {value.estado === "VALIDADA"
                      ? "Consultar o emitir el dictamen según tus permisos."
                      : stats.ready
                        ? "Confirmar la revisión y validar la inspección."
                        : "Revisar las evidencias pendientes de la inspección."}
                  </p>
                </div>
                {value.estado === "VALIDADA" || stats.ready ? (
                  <Button
                    variant="primary"
                    onPress={() => select(value.estado === "VALIDADA" ? "decision" : "validation")}
                  >
                    {value.estado === "VALIDADA" ? "Ver dictamen" : "Ir a validación"}
                  </Button>
                ) : (
                  <Link
                    href={"/inspections/" + id + "/evidences#pending"}
                    className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
                  >
                    Gestionar evidencias →
                  </Link>
                )}
              </section>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Hallazgos registrados", value.hallazgos?.length ?? 0],
                  ["Dictámenes registrados", value.dictamenes?.length ?? 0],
                ].map(([label, count]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
                  >
                    <h2 className="text-sm text-muted">{label}</h2>
                    <strong className="text-xl tabular-nums">{count}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {view === "evidences" ? (
            <InspectionEvidence
              key={id}
              initialBatchId={value.analysis_batch_id}
              aiSupported={value.ai_supported ?? false}
              canAnalyze={
                value.ai_supported === true &&
                value.estado === "EN_CAPTURA" &&
                (value.id_inspector == null || value.id_inspector === actor?.id_usuario) &&
                actor?.rol?.codigo === "INSPECTOR" &&
                canManageCompany(actor, "inspecciones.analizar")
              }
              canReadFruits={canManageCompany(actor, "muestreos.ver")}
              canReview={
                value.estado === "EN_CAPTURA" &&
                (value.id_inspector == null || value.id_inspector === actor?.id_usuario) &&
                actor?.rol?.codigo === "INSPECTOR" &&
                canManageCompany(actor, "inspecciones.validar")
              }
              findings={value.hallazgos ?? []}
              canUpload={
                value.estado === "EN_CAPTURA" &&
                (value.id_inspector == null || value.id_inspector === actor?.id_usuario) &&
                actor?.rol?.codigo === "INSPECTOR" &&
                canManageCompany(actor, "inspecciones.capturar")
              }
              id={id}
              photos={value.evidencias ?? []}
              sampling={value.id_muestreo}
            />
          ) : null}
          {view === "overview" && (tab === "validation" || tab === "decision") ? (
            <InspectionClosure
              key={id + tab}
              inspection={value}
              actor={actor}
              progress={progress}
              refreshing={inspection.isFetching || lotProgress.isFetching}
              onRefresh={() => {
                void inspection.refetch();
                if (lotId && canManageCompany(actor, "lotes.ver")) void lotProgress.refetch();
              }}
              view={tab === "validation" ? "validation" : "decision"}
            />
          ) : null}
        </>
      ) : null}
    </motion.section>
  );
}
