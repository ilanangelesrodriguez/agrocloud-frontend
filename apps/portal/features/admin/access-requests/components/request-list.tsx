"use client";

import { useState } from "react";
import { EmptyState, LoadingState, PagePagination, ErrorState } from "@agrocloud/ui";
import { AdminHeading } from "@/features/admin/components/admin-ui";
import { useAccessRequests } from "../hooks";
import { RequestDetails } from "./request-details";

export function AccessRequests() {
  const [page, setPage] = useState(1);
  const requests = useAccessRequests(page);

  return (
    <section className="space-y-4">
      <AdminHeading title="Solicitudes empresariales" />
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
        <>
          {requests.data.data.length ? (
            requests.data.data.map((request) => (
              <RequestDetails key={request.id} request={request} />
            ))
          ) : (
            <EmptyState
              title="No hay solicitudes en esta página"
              description="Las nuevas solicitudes aparecerán aquí cuando se reciban."
            />
          )}
          <PagePagination last={requests.data.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}
