"use client";

import { useState } from "react";
import { ErrorState, LoadingState } from "@agrocloud/ui";

import { RecordList } from "@/features/agricultural/shared/record-list";
import { useProducersPage } from "../hooks";

export function ProducerList() {
  const [page, setPage] = useState(1);
  const query = useProducersPage(page);

  if (query.isPending) return <LoadingState label="Cargando registros" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;

  return (
    <RecordList
      resource="producers"
      page={page}
      last={query.data.meta.last_page}
      onPageChange={setPage}
      rows={query.data.data.map((row) => ({
        id: row.id_productor,
        title: row.nombre_razon_social,
        detail: row.ruc,
      }))}
    />
  );
}
