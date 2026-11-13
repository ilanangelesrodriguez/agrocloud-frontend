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
} from "@agrocloud/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { useSamplingDetails, useSamplingFruits } from "../hooks";
import { startSamplingInspection } from "@/features/inspections/api";

export function SamplingDetails({ id }: { id: string }) {
  const router = useRouter();
  const cache = useQueryClient();
  const { data: actor } = useCurrentUser();
  const [page, setPage] = useState(1);
  const sample = useSamplingDetails(id, canManageCompany(actor, "muestreos.ver"));
  const fruits = useSamplingFruits(id, page, canManageCompany(actor, "muestreos.ver"));
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
      <PageHeader title={`Muestreo #${id}`} />
      {sample.isPending ? (
        <LoadingState label="Cargando muestreo" />
      ) : sample.isError ? (
        <ErrorState
          error={sample.error}
          retry={() => {
            void sample.refetch();
          }}
        />
      ) : value ? (
        <div className="space-y-4">
          <p>
            Estado: <strong>{value.estado}</strong> · Método: {value.metodo ?? "—"} ·{" "}
            {value.tamano_muestra} frutos
          </p>
          <Link className="text-accent underline" href={"/lots/" + value.id_lote}>
            Volver al lote
          </Link>
          <section className="space-y-3 rounded-card border border-border bg-surface p-4">
            <h2 className="text-xl font-semibold">Inspecciones vinculadas</h2>
            {value.inspecciones?.length ? (
              <ul className="space-y-2">
                {value.inspecciones.map((inspection) => (
                  <li key={inspection.id_inspeccion}>
                    <Link
                      className="text-accent underline"
                      href={"/inspections/" + inspection.id_inspeccion}
                    >
                      Inspección #{inspection.id_inspeccion}
                    </Link>{" "}
                    · {inspection.estado}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No hay inspecciones vinculadas.</p>
            )}
            {canStart ? (
              <Button
                isDisabled={start.isPending}
                type="button"
                variant="primary"
                onPress={() => start.mutate()}
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
      <section className="space-y-3 rounded-card border border-border bg-surface p-4">
        <h2 className="text-xl font-semibold">Frutos de la muestra</h2>
        {fruits.isPending ? (
          <LoadingState label="Cargando frutos" />
        ) : fruits.isError ? (
          <ErrorState
            error={fruits.error}
            retry={() => {
              void fruits.refetch();
            }}
          />
        ) : (
          <>
            <ul className="grid gap-2 sm:grid-cols-2">
              {fruits.data.data.map((fruit) => (
                <li key={fruit.id} className="rounded-lg bg-surface-secondary px-3 py-2">
                  Fruto #{fruit.numero} · {fruit.codigo ?? "Sin código"}
                </li>
              ))}
            </ul>
            <PagePagination last={fruits.data.meta.last_page} page={page} onChange={setPage} />
          </>
        )}
      </section>
    </section>
  );
}
