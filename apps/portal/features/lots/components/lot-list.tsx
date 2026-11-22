"use client";

import { Tabs } from "@heroui/react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
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
  const { data: actor } = useCurrentUser();
  const query = useLotsPage(page, status);
  function changeStatus(next: string) {
    setStatus(next === "all" ? "" : next);
    setPage(1);
  }
  const term = normalize(search.trim());
  const available = [
    "PENDIENTE_RECEPCION",
    "RECIBIDO",
    "EN_MUESTREO",
    "EN_INSPECCION",
    "CLASIFICADO",
    "RECHAZADO",
    "RETENIDO",
    "ANULADO",
  ];

  return (
    <div className="space-y-4">
      <Tabs
        variant="secondary"
        selectedKey={status || "all"}
        onSelectionChange={(key) => changeStatus(String(key))}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Estado de los lotes">
            {[
              ["all", "Todos"],
              ["PENDIENTE_RECEPCION", "Por recibir"],
              ["RECIBIDO", "Recibidos"],
              ["EN_MUESTREO", "En muestreo"],
              ["EN_INSPECCION", "En inspección"],
            ].map(([key, label]) => (
              <Tabs.Tab key={key} id={key}>
                {label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
            {status &&
            !["PENDIENTE_RECEPCION", "RECIBIDO", "EN_MUESTREO", "EN_INSPECCION"].includes(
              status,
            ) ? (
              <Tabs.Tab id={status}>
                {status.replaceAll("_", " ")}
                <Tabs.Indicator />
              </Tabs.Tab>
            ) : null}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
      <ListToolbar
        serverStatus
        placeholder="Código, producto, variedad o productor"
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={changeStatus}
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
              return normalize(values.join(" ")).includes(term);
            })
            .map((row) => ({
              id: row.id_lote,
              title: row.codigo_lote,
              detail: [row.producto, row.variedad, row.productor?.nombre_razon_social]
                .filter(Boolean)
                .join(" · "),
              product: [row.producto, row.variedad].filter(Boolean).join(" · "),
              producer: row.productor?.nombre_razon_social ?? "Productor #" + row.id_productor,
              action:
                row.workflow?.nextAction &&
                row.workflow.nextAction.canExecute !== false &&
                canManageCompany(actor, row.workflow.nextAction.permission)
                  ? { label: row.workflow.nextAction.label, href: row.workflow.nextAction.href }
                  : !row.workflow &&
                      row.estado === "RECIBIDO" &&
                      actor?.rol?.codigo === "INSPECTOR" &&
                      canManageCompany(actor, "muestreos.crear")
                    ? { label: "Ir al muestreo", href: `/lots/${row.id_lote}/sampling` }
                    : !row.workflow &&
                        row.estado === "PENDIENTE_RECEPCION" &&
                        actor?.rol?.codigo === "RECEPCION" &&
                        canManageCompany(actor, "recepciones.crear")
                      ? { label: "Confirmar recepción", href: `/lots/${row.id_lote}/reception` }
                      : undefined,
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
