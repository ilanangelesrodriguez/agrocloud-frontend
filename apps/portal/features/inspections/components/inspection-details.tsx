"use client";

import Link from "next/link";
import { InlineNotice, LoadingState, PageHeader, ErrorState } from "@agrocloud/ui";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { InspectionEvidence } from "@/features/evidences/components/inspection-evidence";
import { useInspectionDetails } from "../hooks";

export function InspectionDetails({ id }: { id: string }) {
  const { data: actor } = useCurrentUser();
  const inspection = useInspectionDetails(id, canManageCompany(actor, "inspecciones.ver"));
  const value = inspection.data?.data;

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
      <PageHeader title={`Inspección #${id}`} />
      {inspection.isPending ? (
        <LoadingState label="Cargando inspección" />
      ) : inspection.isError ? (
        <ErrorState
          error={inspection.error}
          retry={() => {
            void inspection.refetch();
          }}
        />
      ) : value ? (
        <>
          <p>
            Estado: <strong>{value.estado}</strong> · Inspector #
            {value.id_inspector ?? "sin asignar"}
          </p>
          <Link className="text-accent underline" href={"/samplings/" + value.id_muestreo}>
            Volver al muestreo
          </Link>
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
          <InspectionEvidence
            key={id}
            canAnalyze={
              value.estado === "EN_CAPTURA" &&
              (value.id_inspector == null || value.id_inspector === actor?.id_usuario) &&
              actor?.rol?.codigo === "INSPECTOR" &&
              canManageCompany(actor, "inspecciones.analizar")
            }
            canReadFruits={canManageCompany(actor, "muestreos.ver")}
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
        </>
      ) : null}
    </section>
  );
}
