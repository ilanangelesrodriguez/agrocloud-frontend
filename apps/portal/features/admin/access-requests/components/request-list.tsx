"use client";

import { AdminFilterBar, matchesSearch } from "@/features/admin/components/admin-filter-bar";
import { useState } from "react";
import { EmptyState, LoadingState, PagePagination, ErrorState } from "@agrocloud/ui";

import { useAccessRequests } from "../hooks";

import { RequestDetails } from "./request-details";

import { AdminHeading } from "@/features/admin/components/admin-ui";

export function AccessRequests() {
  const [page, setPage] = useState(1);
  const requests = useAccessRequests(page);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const priority: Record<string, number> = {
    PENDIENTE: 0,
    EN_REVISION: 1,
    APROBADA: 2,
    RECHAZADA: 3,
  };
  const rows = (requests.data?.data ?? [])
    .filter(
      (request) =>
        (status === "all" || request.estado === status) &&
        matchesSearch([request.ruc, request.razon_social, request.correo], search),
    )
    .sort((a, b) => (priority[a.estado] ?? 4) - (priority[b.estado] ?? 4));

  return (
    <section className="space-y-4">
      <AdminHeading title="Solicitudes empresariales" />
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        placeholder="RUC, razón social o correo"
        states={[
          { id: "all", label: "Todas" },
          { id: "PENDIENTE", label: "Pendientes" },
          { id: "EN_REVISION", label: "En revisión" },
          { id: "APROBADA", label: "Aprobadas" },
          { id: "RECHAZADA", label: "Rechazadas" },
        ]}
      />
      <p className="text-xs text-muted">
        Se muestran primero las pendientes y en revisión dentro de la página cargada.
      </p>
      {requests.isPending ? (
        <LoadingState label="Cargando solicitudes" />
      ) : requests.isError ? (
        <ErrorState
          error={requests.error}
          retry={() => {
            void requests.refetch();
          }}
        />
      ) : (
        <div className="paginated-content">
          {rows.length ? (
            rows.map((request) => <RequestDetails key={request.id} request={request} />)
          ) : (
            <EmptyState
              description="Las nuevas solicitudes aparecerán aquí cuando se reciban."
              title="No hay solicitudes en esta página"
            />
          )}
          <PagePagination last={requests.data.last_page} page={page} onChange={setPage} />
        </div>
      )}
    </section>
  );
}
