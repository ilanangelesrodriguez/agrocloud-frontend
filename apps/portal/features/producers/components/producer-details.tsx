"use client";

import { FiEdit3 } from "react-icons/fi";

import Link from "next/link";
import { LoadingState, ErrorState } from "@agrocloud/ui";

import { useProducerDetails } from "../hooks";
import { ProducerForm } from "./producer-form";

export function ProducerDetails({
  id,
  edit,
  canEdit,
}: {
  id: string;
  edit: boolean;
  canEdit: boolean;
}) {
  const query = useProducerDetails(id);
  if (query.isPending) return <LoadingState label="Cargando registro" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const producer = query.data.producer;
  if (edit) return <ProducerForm key={id} canRead producer={producer} />;

  const fields = [
    ["Razón social", producer.nombre_razon_social],
    ["RUC", producer.ruc],
    ["Fundo", producer.fundo],
    ["Ubicación", producer.ubicacion],
    ["Departamento", producer.departamento],
    ["Provincia", producer.provincia],
    ["Distrito", producer.distrito],
    ["Ubigeo", producer.ubigeo],
    [
      "Verificación tributaria",
      producer.sunat_verificacion?.resultado ?? "Sin resultado registrado",
    ],
    ["Estado SUNAT", producer.sunat_verificacion?.estado],
    ["Condición SUNAT", producer.sunat_verificacion?.condicion],
  ];
  return (
    <div className="space-y-4">
      <dl className="grid gap-4 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="break-words">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {canEdit ? (
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-accent hover:bg-default"
          href={"/producers/" + id + "/edit"}
        >
          <FiEdit3 aria-hidden="true" /> Editar productor
        </Link>
      ) : null}
    </div>
  );
}
