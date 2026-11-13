"use client";

import { LoadingState, ErrorState } from "@agrocloud/ui";

import { useLotDetails } from "../hooks";
import { LotOperations } from "./lot-operations";
import { LotWorkflow } from "./lot-workflow";

export function LotDetails({ id }: { id: string }) {
  const query = useLotDetails(id);
  if (query.isPending) return <LoadingState label="Cargando registro" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const lot = query.data.lot;
  const fields = [
    ["Código", lot.codigo_lote],
    ["Productor", lot.productor?.nombre_razon_social ?? String(lot.id_productor)],
    ["Producto", lot.producto],
    ["Variedad", lot.variedad],
    ["Peso", lot.peso_kg + " " + lot.unidad_medida],
    ["Estado", lot.estado.replaceAll("_", " ")],
    ["Llegada prevista", new Date(lot.fecha_llegada_prevista).toLocaleString("es-PE")],
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
      <LotWorkflow lot={lot} />
      <LotOperations lot={lot} />
    </div>
  );
}
