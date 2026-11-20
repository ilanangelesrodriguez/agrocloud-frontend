"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, toast } from "@heroui/react";
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
  const current = value?.inspecciones?.find((item) => item.estado === "EN_CAPTURA");
  const canStart =
    actor?.rol?.codigo === "INSPECTOR" &&
    canManageCompany(actor, "inspecciones.crear") &&
    Boolean(
      value &&
      value.estado !== "COMPLETADO" &&
      (!value.inspecciones?.length ||
        (current && (current.id_inspector == null || current.id_inspector === actor?.id_usuario))),
    );

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
    <section className="space-y-5">
      <PageHeader
        title={`Muestreo #${id}`}
        description="Consulta la muestra registrada, revisa sus frutos y continúa con la inspección."
        actions={
          <Link
            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium"
            href={value ? `/lots/${value.id_lote}/sampling` : "/lots"}
          >
            Volver al lote
          </Link>
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
              <dt className="text-sm text-muted">Estado</dt>
              <dd className="mt-2">
                <StatusBadge tone="neutral">{value.estado.replaceAll("_", " ")}</StatusBadge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Método</dt>
              <dd className="mt-2 font-semibold">{value.metodo ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Tamaño de muestra</dt>
              <dd className="mt-2 text-xl font-semibold tabular-nums">
                {value.tamano_muestra} frutos
              </dd>
            </div>
          </dl>
          <section className="space-y-3 rounded-card border border-border bg-surface p-4">
            <h2 className="text-xl font-semibold">Inspecciones vinculadas</h2>
            {value.inspecciones?.length ? (
              <ul className="space-y-3">
                {value.inspecciones.map((inspection) => (
                  <li
                    key={inspection.id_inspeccion}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                  >
                    <Link
                      className="font-semibold text-accent"
                      href={"/inspections/" + inspection.id_inspeccion}
                    >
                      Inspección #{inspection.id_inspeccion}
                    </Link>{" "}
                    <StatusBadge tone={inspection.estado === "EN_CAPTURA" ? "info" : "neutral"}>
                      {inspection.estado.replaceAll("_", " ")}
                    </StatusBadge>
                    {canManageCompany(actor, "inspecciones.ver") ? (
                      <Link
                        className="text-sm font-medium text-accent"
                        href={`/inspections/${inspection.id_inspeccion}/evidences`}
                      >
                        Ver evidencias
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No hay inspecciones vinculadas.</p>
            )}
            {current && !canStart ? (
              <Link
                className="font-medium text-accent underline"
                href={"/inspections/" + current.id_inspeccion}
              >
                Consultar inspección en captura
              </Link>
            ) : null}
            {canStart ? (
              <Button
                isDisabled={start.isPending}
                type="button"
                variant="primary"
                onPress={() => {
                  if (current) {
                    router.push("/inspections/" + current.id_inspeccion);
                  } else {
                    start.mutate();
                  }
                }}
              >
                {start.isPending
                  ? "Procesando…"
                  : current
                    ? "Continuar inspección"
                    : "Iniciar inspección"}
              </Button>
            ) : null}
            {start.error ? <FormNotice message={start.error.message} /> : null}
          </section>
        </div>
      ) : null}
      {sample.isSuccess ? (
        <section className="space-y-3 rounded-card border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Frutos de la muestra</h2>
          {fruits.isPending ? (
            <LoadingState label="Cargando frutos" />
          ) : fruits.isError ? (
            <ErrorState error={fruits.error} retry={() => fruits.refetch()} />
          ) : (
            <>
              <ul className="grid gap-2 sm:grid-cols-2">
                {fruits.data.data.map((fruit) => (
                  <li key={fruit.id} className="rounded-lg bg-surface-secondary px-3 py-2">
                    Fruto #{fruit.numero} · {fruit.codigo ?? "Sin código"}
                  </li>
                ))}
              </ul>
              {!fruits.data.data.length ? (
                <EmptyState
                  title="Sin frutos en esta página"
                  description="Los frutos registrados para la muestra aparecerán aquí."
                />
              ) : null}
              <PagePagination last={fruits.data.meta.last_page} page={page} onChange={setPage} />
            </>
          )}
        </section>
      ) : null}
    </section>
  );
}
