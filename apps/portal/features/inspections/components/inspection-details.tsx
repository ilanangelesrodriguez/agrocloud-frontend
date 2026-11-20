"use client";

import Link from "next/link";
import { InlineNotice, LoadingState, PageHeader, ErrorState, StatusBadge } from "@agrocloud/ui";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { InspectionEvidence } from "@/features/evidences/components/inspection-evidence";
import { useInspectionDetails } from "../hooks";
import { OperationNavigation } from "@/features/agricultural/shared/operation-navigation";
import { InspectionClosure } from "./inspection-closure";

export function InspectionDetails({
  id,
  view = "overview",
}: {
  id: string;
  view?: "overview" | "evidences";
}) {
  const session = useCurrentUser();
  const actor = session.data;
  const inspection = useInspectionDetails(id, canManageCompany(actor, "inspecciones.ver"));
  const value = inspection.data?.data;

  if (session.isPending) return <LoadingState label="Verificando acceso a la inspección" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;

  if (actor && !canManageCompany(actor, "inspecciones.ver")) {
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="No tienes permiso para consultar inspecciones."
      />
    );
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title={view === "evidences" ? `Evidencias de inspección #${id}` : `Inspección #${id}`}
        description={
          view === "evidences"
            ? "Captura fotografías por fruto, consulta las evidencias y solicita su análisis."
            : "Revisa el estado de la inspección y continúa con las evidencias de la muestra."
        }
        actions={
          <Link
            href={
              view === "evidences"
                ? `/inspections/${id}`
                : value && canManageCompany(actor, "muestreos.ver")
                  ? `/samplings/${value.id_muestreo}`
                  : "/lots"
            }
            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium"
          >
            {view === "evidences"
              ? "Volver a la inspección"
              : value && canManageCompany(actor, "muestreos.ver")
                ? "Volver al muestreo"
                : "Volver a lotes"}
          </Link>
        }
      />
      {inspection.isPending ? (
        <LoadingState label="Cargando inspección" />
      ) : inspection.isError ? (
        <ErrorState error={inspection.error} retry={() => inspection.refetch()} />
      ) : value ? (
        <>
          <OperationNavigation
            lotId={value.muestreo?.id_lote}
            samplingId={value.id_muestreo}
            inspectionId={id}
            current={view === "evidences" ? "evidence" : "inspection"}
            canReadLot={canManageCompany(actor, "lotes.ver")}
            canReadSampling={canManageCompany(actor, "muestreos.ver")}
            canReadInspection={canManageCompany(actor, "inspecciones.ver")}
          />
          <p className="rounded-2xl border border-border bg-surface p-5">
            Estado:{" "}
            <StatusBadge tone={value.estado === "EN_CAPTURA" ? "info" : "neutral"}>
              {value.estado.replaceAll("_", " ")}
            </StatusBadge>{" "}
            · Inspector #{value.id_inspector ?? "sin asignar"}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-semibold">Evidencias</h2>
              <p className="text-2xl">{value.evidencias?.length ?? 0}</p>
            </div>
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-semibold">Hallazgos</h2>
              <p className="text-2xl">{value.hallazgos?.length ?? 0}</p>
            </div>
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-semibold">Dictámenes</h2>
              <p className="text-2xl">{value.dictamenes?.length ?? 0}</p>
            </div>
          </div>
          {value.estado === "EN_CAPTURA" && !value.evidencias?.length ? (
            <InlineNotice
              status="default"
              title="Pendiente de evidencias"
              description="Adjunta una fotografía de un fruto para iniciar el análisis IA si tu rol lo permite."
            />
          ) : null}
          {view === "overview" ? (
            <section className="space-y-4 rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-xl font-semibold">Evidencias de la inspección</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted">
                Trabaja con las fotografías de cada fruto en una vista dedicada. Podrás consultar
                las capturas, adjuntar nuevas imágenes y solicitar el análisis según tus permisos.
              </p>
              <Link
                href={`/inspections/${id}/evidences`}
                className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
              >
                Gestionar evidencias
              </Link>
            </section>
          ) : (
            <InspectionEvidence
              key={id}
              canAnalyze={
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
          )}
          {view === "overview" ? (
            <InspectionClosure key={id} inspection={value} actor={actor} />
          ) : (
            <Link
              href={`/inspections/${id}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-accent"
            >
              Continuar a validación y dictamen
            </Link>
          )}
        </>
      ) : null}
    </section>
  );
}
