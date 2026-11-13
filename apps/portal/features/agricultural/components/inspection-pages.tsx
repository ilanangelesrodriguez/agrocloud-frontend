"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminRequest } from "@/features/admin/api";
import { AdminError, AdminPagination } from "@/features/admin/components/admin-ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { inspectionCreated, inspectionDetail, samplingDetail, samplingFruits } from "../inspection";
import { InspectionEvidence } from "./inspection-evidence";

export function SamplingDetails({ id }: { id: string }) {
  const router = useRouter();
  const cache = useQueryClient();
  const { data: actor } = useCurrentUser();
  const [page, setPage] = useState(1);
  const sample = useQuery({
    enabled: canManageCompany(actor, "muestreos.ver"),
    queryKey: ["agricultural", "samplings", "detail", id],
    queryFn: ({ signal }) => adminRequest("samplings/" + id, samplingDetail, { signal }, "agricultural"),
    retry: false,
  });
  const fruits = useQuery({
    enabled: canManageCompany(actor, "muestreos.ver"),
    queryKey: ["agricultural", "samplings", "fruits", id, page],
    queryFn: ({ signal }) => adminRequest("samplings/" + id + "/fruits?page=" + page, samplingFruits, { signal }, "agricultural"),
    retry: false,
  });
  const start = useMutation({
    mutationFn: () => adminRequest("samplings/" + id + "/inspections", inspectionCreated, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
    }, "agricultural"),
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
  const canStart = actor?.rol?.codigo === "INSPECTOR" && canManageCompany(actor, "inspecciones.crear") &&
    Boolean(value && value.estado !== "COMPLETADO" &&
      (!value.inspecciones?.length || (current && (current.id_inspector == null || current.id_inspector === actor?.id_usuario))));

  if (actor && !canManageCompany(actor, "muestreos.ver")) {
    return <p role="alert">No tienes permiso para consultar muestreos.</p>;
  }

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-semibold">Muestreo #{id}</h1>
      {sample.isPending ? <p role="status">Cargando muestreo…</p> : sample.isError ? (
        <AdminError error={sample.error} retry={() => { void sample.refetch(); }} />
      ) : value ? (
        <div className="space-y-4">
          <p>Estado: <strong>{value.estado}</strong> · Método: {value.metodo ?? "—"} · {value.tamano_muestra} frutos</p>
          <Link className="text-accent underline" href={"/lots/" + value.id_lote}>Volver al lote</Link>
          <section className="space-y-3 rounded-card border border-border bg-surface p-4">
            <h2 className="text-xl font-semibold">Inspecciones vinculadas</h2>
            {value.inspecciones?.length ? (
              <ul className="space-y-2">
                {value.inspecciones.map((inspection) => (
                  <li key={inspection.id_inspeccion}>
                    <Link className="text-accent underline" href={"/inspections/" + inspection.id_inspeccion}>
                      Inspección #{inspection.id_inspeccion}
                    </Link> · {inspection.estado}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted">No hay inspecciones vinculadas.</p>}
            {canStart ? (
              <Button type="button" variant="primary" isDisabled={start.isPending} onPress={() => start.mutate()}>
                {start.isPending ? "Procesando…" : current ? "Continuar inspección" : "Iniciar inspección"}
              </Button>
            ) : null}
            {start.error ? <p role="alert">{start.error.message}</p> : null}
          </section>
        </div>
      ) : null}
      <section className="space-y-3 rounded-card border border-border bg-surface p-4">
        <h2 className="text-xl font-semibold">Frutos de la muestra</h2>
        {fruits.isPending ? <p role="status">Cargando frutos…</p> : fruits.isError ? (
          <AdminError error={fruits.error} retry={() => { void fruits.refetch(); }} />
        ) : (
          <>
            <ul className="grid gap-2 sm:grid-cols-2">
              {fruits.data.data.map((fruit) => <li key={fruit.id} className="rounded-lg bg-surface-secondary px-3 py-2">
                Fruto #{fruit.numero} · {fruit.codigo ?? "Sin código"}
              </li>)}
            </ul>
            <AdminPagination page={page} last={fruits.data.meta.last_page} onChange={setPage} />
          </>
        )}
      </section>
    </section>
  );
}

export function InspectionDetails({ id }: { id: string }) {
  const { data: actor } = useCurrentUser();
  const inspection = useQuery({
    enabled: canManageCompany(actor, "inspecciones.ver"),
    queryKey: ["agricultural", "inspections", "detail", id],
    queryFn: ({ signal }) => adminRequest("inspections/" + id, inspectionDetail, { signal }, "agricultural"),
    refetchInterval: ({ state }) => state.data?.data.evidencias?.some(({ estado_ia }) =>
      estado_ia === "EN_COLA" || estado_ia === "PROCESANDO") ? 5000 : false,
    retry: false,
  });
  const value = inspection.data?.data;
  if (actor && !canManageCompany(actor, "inspecciones.ver")) {
    return <p role="alert">No tienes permiso para consultar inspecciones.</p>;
  }
  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-semibold">Inspección #{id}</h1>
      {inspection.isPending ? <p role="status">Cargando inspección…</p> : inspection.isError ? (
        <AdminError error={inspection.error} retry={() => { void inspection.refetch(); }} />
      ) : value ? (
        <>
          <p>Estado: <strong>{value.estado}</strong> · Inspector #{value.id_inspector ?? "sin asignar"}</p>
          <Link className="text-accent underline" href={"/samplings/" + value.id_muestreo}>Volver al muestreo</Link>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-semibold">Evidencias</h2><p className="text-2xl">{value.evidencias?.length ?? 0}</p>
            </div>
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-semibold">Hallazgos</h2><p className="text-2xl">{value.hallazgos?.length ?? 0}</p>
            </div>
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-semibold">Dictámenes</h2><p className="text-2xl">{value.dictamenes?.length ?? 0}</p>
            </div>
          </div>
          <InspectionEvidence
            key={id}
            id={id}
            sampling={value.id_muestreo}
            photos={value.evidencias ?? []}
            canReadFruits={canManageCompany(actor, "muestreos.ver")}
            canUpload={value.estado === "EN_CAPTURA" && (value.id_inspector == null || value.id_inspector === actor?.id_usuario) &&
              actor?.rol?.codigo === "INSPECTOR" && canManageCompany(actor, "inspecciones.capturar")}
            canAnalyze={value.estado === "EN_CAPTURA" && (value.id_inspector == null || value.id_inspector === actor?.id_usuario) &&
              actor?.rol?.codigo === "INSPECTOR" && canManageCompany(actor, "inspecciones.analizar")}
          />
        </>
      ) : null}
    </section>
  );
}
