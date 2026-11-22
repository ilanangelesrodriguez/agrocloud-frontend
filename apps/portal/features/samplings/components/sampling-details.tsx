"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Chip, toast } from "@heroui/react";
import {
  FormNotice,
  InlineNotice,
  LoadingState,
  PageHeader,
  ErrorState,
  PagePagination,
  StatusBadge,
  EmptyState,
} from "@agrocloud/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { useSamplingDetails, useSamplingFruits } from "../hooks";
import { startSamplingInspection } from "@/features/inspections/api";
import { OperationNavigation } from "@/features/agricultural/shared/operation-navigation";

export function SamplingDetails({ id }: { id: string }) {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const cache = useQueryClient();
  const session = useCurrentUser();
  const actor = session.data;
  const [page, setPage] = useState(1);
  const sample = useSamplingDetails(id, canManageCompany(actor, "muestreos.ver"));
  const fruits = useSamplingFruits(
    id,
    page,
    canManageCompany(actor, "muestreos.ver") && sample.isSuccess,
  );
  const start = useMutation({
    mutationFn: () => startSamplingInspection(id),
    onSuccess: ({ data }) => {
      toast.success("Inspección iniciada");
      void cache.invalidateQueries({ queryKey: ["agricultural", "samplings", "detail", id] });
      void cache.invalidateQueries({ queryKey: ["agricultural", "lots"] });
      router.push("/inspections/" + data.id_inspeccion);
    },
    retry: false,
  });

  const value = sample.data?.data;
  const current = [...(value?.inspecciones ?? [])]
    .sort((a, b) => b.id_inspeccion - a.id_inspeccion)
    .find((item) => item.estado === "EN_CAPTURA");
  const canReadInspection = canManageCompany(actor, "inspecciones.ver");
  const canReadLot = canManageCompany(actor, "lotes.ver");
  const canStart =
    actor?.rol?.codigo === "INSPECTOR" &&
    canManageCompany(actor, "inspecciones.crear") &&
    Boolean(value && value.estado !== "COMPLETADO" && !value.inspecciones?.length);

  if (session.isPending) return <LoadingState label="Verificando acceso al muestreo" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;

  if (actor && !canManageCompany(actor, "muestreos.ver")) {
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="No tienes permiso para consultar muestreos."
      />
    );
  }

  return (
    <motion.section
      className="space-y-5"
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.15 }}
    >
      <PageHeader
        title={`Muestreo #${id}`}
        description={
          value
            ? [value.lote?.codigo_lote ?? "Lote #" + value.id_lote, value.metodo]
                .filter(Boolean)
                .join(" · ")
            : "Consulta la muestra registrada, revisa sus frutos y continúa con la inspección."
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {value ? (
              <Chip
                size="sm"
                variant="soft"
                color={value.estado === "COMPLETADO" ? "success" : "default"}
              >
                {value.estado.replaceAll("_", " ").toLocaleLowerCase("es")}
              </Chip>
            ) : null}
            <Link
              className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium"
              href={value && canReadLot ? `/lots/${value.id_lote}/sampling` : "/samplings"}
            >
              {canReadLot ? "Volver al lote" : "Volver a muestreos"}
            </Link>
          </div>
        }
      />
      {sample.isPending ? (
        <LoadingState label="Cargando muestreo" />
      ) : sample.isError ? (
        <ErrorState error={sample.error} retry={() => sample.refetch()} />
      ) : value ? (
        <div className="space-y-4">
          <OperationNavigation
            lotId={value.id_lote}
            samplingId={value.id_muestreo}
            inspectionId={current?.id_inspeccion ?? value.inspecciones?.[0]?.id_inspeccion}
            current="sampling"
            canReadLot={canManageCompany(actor, "lotes.ver")}
            canReadSampling={canManageCompany(actor, "muestreos.ver")}
            canReadInspection={canManageCompany(actor, "inspecciones.ver")}
          />
          <dl className="grid gap-5 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Inspecciones vinculadas</dt>
              <dd className="mt-2 text-xl font-semibold tabular-nums">
                {value.inspecciones?.length ?? 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Método</dt>
              <dd className="mt-2 font-semibold">{value.metodo ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Tamaño de muestra</dt>
              <dd className="mt-2 text-xl font-semibold tabular-nums">
                {value.tamano_muestra} {value.tamano_muestra === 1 ? "fruto" : "frutos"}
              </dd>
            </div>
          </dl>
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Inspecciones vinculadas</h2>
              <p className="mt-1 text-sm text-muted">
                Continúa la captura o consulta los registros de esta muestra.
              </p>
            </div>
            {value.inspecciones?.length ? (
              <ul className="grid items-start gap-3 lg:grid-cols-2">
                {[...value.inspecciones]
                  .sort(
                    (a, b) =>
                      Number(b.estado === "EN_CAPTURA") - Number(a.estado === "EN_CAPTURA") ||
                      b.id_inspeccion - a.id_inspeccion,
                  )
                  .map((inspection) => {
                    const canContinue =
                      inspection.estado === "EN_CAPTURA" &&
                      actor?.rol?.codigo === "INSPECTOR" &&
                      canReadInspection &&
                      canManageCompany(actor, "inspecciones.capturar") &&
                      (inspection.id_inspector == null ||
                        inspection.id_inspector === actor?.id_usuario);
                    return (
                      <li
                        key={inspection.id_inspeccion}
                        className={
                          "space-y-3 rounded-xl border p-4 " +
                          (canContinue ? "border-accent/30 bg-accent/5" : "border-border")
                        }
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold">Inspección #{inspection.id_inspeccion}</h3>
                          <StatusBadge
                            tone={
                              inspection.estado === "EN_CAPTURA"
                                ? "info"
                                : inspection.estado === "VALIDADA"
                                  ? "success"
                                  : "neutral"
                            }
                          >
                            {inspection.estado.replaceAll("_", " ").toLocaleLowerCase("es")}
                          </StatusBadge>
                        </div>
                        <p className="text-xs text-muted">
                          {inspection.estado === "EN_CAPTURA"
                            ? "Captura en curso"
                            : "Registro de inspección"}{" "}
                          · Vinculada al muestreo #{value.id_muestreo}
                        </p>
                        {inspection.estado === "EN_CAPTURA" &&
                        inspection.id_inspector != null &&
                        inspection.id_inspector !== actor?.id_usuario ? (
                          <p className="text-xs text-muted">Asignada a otro inspector.</p>
                        ) : null}
                        {canReadInspection ? (
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={"/inspections/" + inspection.id_inspeccion}
                              className={
                                "inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-medium " +
                                (canContinue
                                  ? "bg-accent text-accent-foreground"
                                  : "border border-border text-accent")
                              }
                            >
                              {canContinue ? "Continuar inspección" : "Consultar inspección"}
                            </Link>
                            <Link
                              href={"/inspections/" + inspection.id_inspeccion + "/evidences"}
                              className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-accent"
                            >
                              {inspection.estado === "VALIDADA"
                                ? "Consultar evidencias"
                                : "Ver evidencias"}
                            </Link>
                          </div>
                        ) : (
                          <p className="text-xs text-muted">
                            Tu cuenta no tiene permiso para abrir esta inspección.
                          </p>
                        )}
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <div className="space-y-3 rounded-xl bg-surface-secondary p-4">
                <p className="text-sm text-muted">No hay inspecciones vinculadas a esta muestra.</p>
                {canStart ? (
                  <Button
                    isPending={start.isPending}
                    type="button"
                    variant="primary"
                    onPress={() => {
                      if (!start.isPending) start.mutate();
                    }}
                  >
                    Iniciar inspección
                  </Button>
                ) : (
                  <p className="text-xs text-muted">
                    El inicio requiere un inspector autorizado y un muestreo habilitado para esta
                    operación.
                  </p>
                )}
              </div>
            )}
            {start.error ? <FormNotice message={start.error.message} /> : null}
          </section>
        </div>
      ) : null}
      {sample.isSuccess ? (
        <section className="space-y-3 rounded-card border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Frutos de la muestra</h2>
            <p className="text-xs text-muted">
              {value?.tamano_muestra} {value?.tamano_muestra === 1 ? "fruto" : "frutos"} en la
              muestra
            </p>
          </div>
          {fruits.isPending ? (
            <LoadingState label="Cargando frutos" />
          ) : fruits.isError ? (
            <ErrorState error={fruits.error} retry={() => fruits.refetch()} />
          ) : (
            <div className="space-y-4">
              <ul className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {fruits.data.data.map((fruit) => (
                  <li
                    key={fruit.id}
                    className="space-y-1 rounded-xl border border-border bg-surface-secondary p-4"
                  >
                    <h3 className="text-sm font-semibold">Fruto #{fruit.numero}</h3>
                    <p className="break-all text-xs text-muted">{fruit.codigo ?? "Sin código"}</p>
                  </li>
                ))}
              </ul>
              {!fruits.data.data.length ? (
                <EmptyState
                  title="Sin frutos en esta página"
                  description="Los frutos registrados para la muestra aparecerán aquí."
                />
              ) : null}
              <p className="text-xs text-muted">
                {fruits.data.data.length}{" "}
                {fruits.data.data.length === 1 ? "fruto mostrado" : "frutos mostrados"} en esta
                página. La captura y revisión de evidencias se consultan desde la inspección.
              </p>
              {fruits.data.meta.last_page > 1 ? (
                <PagePagination
                  last={fruits.data.meta.last_page}
                  page={page}
                  isDisabled={fruits.isFetching}
                  onChange={setPage}
                />
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </motion.section>
  );
}
