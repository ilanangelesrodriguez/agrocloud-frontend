"use client";

import { useState } from "react";
import { ErrorState, LoadingState } from "@agrocloud/ui";

import { RecordList } from "@/features/agricultural/shared/record-list";
import { useLotsPage } from "../hooks";

export function LotList() {
  const [page, setPage] = useState(1);
  const query = useLotsPage(page);

  if (query.isPending) return <LoadingState label="Cargando registros" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;

  return (
    <RecordList
      resource="lots"
      page={page}
      last={query.data.meta.last_page}
      onPageChange={setPage}
      rows={query.data.data.map((row) => ({
        id: row.id_lote,
        title: row.codigo_lote,
        detail: row.producto + " · " + row.estado.replaceAll("_", " "),
      }))}
    />
  );
}
