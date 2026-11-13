"use client";

import { useState } from "react";
import { ErrorState, LoadingState } from "@agrocloud/ui";

import { RecordList } from "@/features/agricultural/shared/record-list";
import { ListToolbar } from "@/features/agricultural/shared/list-toolbar";
import { useLotsPage } from "../hooks";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function LotList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const query = useLotsPage(page);
  const term = normalize(search.trim());
  const available = Array.from(new Set(query.data?.data.map((lot) => lot.estado) ?? [])).sort();

  return (
    <div className="space-y-4">
      <ListToolbar
        placeholder="Código, producto, variedad o productor"
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(next) => setStatus(next === "all" ? "" : next)}
        statuses={available.map((value) => ({ value, label: value.replaceAll("_", " ") }))}
        onRefresh={() => void query.refetch()}
        refreshing={query.isFetching}
      />
      {query.isPending ? (
        <LoadingState label="Cargando lotes" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <RecordList
          resource="lots"
          page={page}
          last={query.data.meta.last_page}
          onPageChange={setPage}
          filtered={Boolean(term || status)}
          rows={query.data.data
            .filter((row) => {
              const values = [
                row.codigo_lote,
                row.producto,
                row.variedad ?? "",
                row.productor?.nombre_razon_social ?? "",
              ];
              return (
                normalize(values.join(" ")).includes(term) && (!status || status === row.estado)
              );
            })
            .map((row) => ({
              id: row.id_lote,
              title: row.codigo_lote,
              detail: [row.producto, row.variedad, row.productor?.nombre_razon_social]
                .filter(Boolean)
                .join(" · "),
              status: {
                label: row.estado.replaceAll("_", " "),
                tone: (row.estado === "RECIBIDO"
                  ? "success"
                  : row.estado === "PENDIENTE_RECEPCION"
                    ? "warning"
                    : "neutral") as "success" | "warning" | "neutral",
              },
            }))}
        />
      )}
    </div>
  );
}
