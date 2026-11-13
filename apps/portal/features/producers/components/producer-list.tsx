"use client";

import { useState } from "react";
import { ErrorState, LoadingState } from "@agrocloud/ui";

import { RecordList } from "@/features/agricultural/shared/record-list";
import { ListToolbar } from "@/features/agricultural/shared/list-toolbar";
import { useProducersPage } from "../hooks";

function normalized(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function ProducerList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const query = useProducersPage(page);
  const term = normalized(search.trim());

  return (
    <div className="space-y-4">
      <ListToolbar
        placeholder="Razón social, RUC, fundo o ubicación"
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => void query.refetch()}
        refreshing={query.isFetching}
      />
      {query.isPending ? (
        <LoadingState label="Cargando productores" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <RecordList
          resource="producers"
          page={page}
          last={query.data.meta.last_page}
          onPageChange={setPage}
          filtered={Boolean(term)}
          rows={query.data.data
            .filter((row) =>
              normalized(
                [row.nombre_razon_social, row.ruc, row.fundo, row.ubicacion].join(" "),
              ).includes(term),
            )
            .map((row) => ({
              id: row.id_productor,
              title: row.nombre_razon_social,
              detail: [row.ruc, row.fundo, row.ubicacion].filter(Boolean).join(" · "),
            }))}
        />
      )}
    </div>
  );
}
