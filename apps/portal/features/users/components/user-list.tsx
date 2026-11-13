"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
  ErrorState,
  PagePagination,
  InlineNotice,
} from "@agrocloud/ui";
import type { UserPolicy } from "../policy";
import { useUsersPage } from "../hooks";
import { userStatus, userTone } from "./user-status";

export function SharedUsersList({ policy }: { policy: UserPolicy }) {
  const [page, setPage] = useState(1);
  const { scope, base } = policy;
  const users = useUsersPage(scope, policy.canRead, page);

  if (!policy.canRead) {
    return (
      <InlineNotice
        title="Acceso restringido"
        status="warning"
        description="No tienes permiso para consultar usuarios."
      />
    );
  }

  return (
    <section className="space-y-4">
      <PageHeader title={policy.title} />
      {policy.canInvite ? (
        <Link className="inline-block text-accent underline" href={base + "/new"}>
          Invitar usuario
        </Link>
      ) : null}
      {users.isPending ? (
        <LoadingState label="Cargando usuarios" />
      ) : users.isError ? (
        <ErrorState
          error={users.error}
          retry={() => {
            void users.refetch();
          }}
        />
      ) : (
        <>
          {users.data.data.length ? (
            <ul className="divide-y divide-border rounded-card border border-border bg-surface">
              {users.data.data.map((user) => (
                <li key={user.id_usuario} className="space-y-1 p-4">
                  <Link
                    className="font-semibold text-accent underline"
                    href={base + "/" + user.id_usuario}
                  >
                    {user.nombre} {user.apellido}
                  </Link>
                  <p className="break-words text-sm text-muted">
                    {user.correo} · {user.rol?.nombre ?? "Sin rol"} ·{" "}
                    <StatusBadge tone={userTone(user)}>{userStatus(user)}</StatusBadge>
                  </p>
                  {policy.showCompanyLink && user.id_empresa ? (
                    <Link
                      className="text-sm text-accent underline"
                      href={"/admin/companies/" + user.id_empresa}
                    >
                      Empresa #{user.id_empresa}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No hay usuarios en esta página"
              description="Los usuarios registrados aparecerán aquí."
            />
          )}
          <PagePagination last={users.data.meta.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}
