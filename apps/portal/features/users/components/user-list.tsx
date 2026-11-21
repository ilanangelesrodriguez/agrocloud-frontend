"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Table } from "@heroui/react";
import { FiPlus, FiEye } from "react-icons/fi";
import { CreationDrawer } from "@/components/creation-drawer";
import { SharedUserForm } from "./user-form";
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

export function SharedUsersList({
  policy,
  initialCreate = false,
}: {
  policy: UserPolicy;
  initialCreate?: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [inviting, setInviting] = useState(initialCreate);
  const [saving, setSaving] = useState(false);
  const { scope, base } = policy;
  const users = useUsersPage(scope, policy.canRead, page);
  function setOpen(open: boolean) {
    setInviting(open);
    if (!open && initialCreate) router.replace(base);
  }

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
      <PageHeader
        title={policy.title}
        description="Gestiona los accesos, las invitaciones y los roles de tu equipo."
        actions={
          policy.canInvite ? (
            <CreationDrawer
              open={inviting}
              onOpenChange={setOpen}
              busy={saving}
              title="Invitar usuario"
              description="Enviaremos un enlace para que active su cuenta y defina su contraseña."
              trigger={
                <Button variant="primary" onPress={() => setInviting(true)}>
                  <FiPlus aria-hidden="true" /> Invitar usuario
                </Button>
              }
            >
              <SharedUserForm
                policy={policy}
                onBusyChange={setSaving}
                onSaved={() => {
                  setPage(1);
                  setOpen(false);
                }}
              />
            </CreationDrawer>
          ) : undefined
        }
      />
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
        <div className="paginated-content">
          {users.data.data.length ? (
            <Table className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <Table.ScrollContainer>
                <Table.Content aria-label="Usuarios registrados">
                  <Table.Header>
                    <Table.Column isRowHeader>Usuario</Table.Column>
                    <Table.Column>Rol</Table.Column>
                    <Table.Column>Estado</Table.Column>
                    <Table.Column>Acciones</Table.Column>
                  </Table.Header>
                  <Table.Body items={users.data.data}>
                    {(user) => (
                      <Table.Row id={user.id_usuario} className="h-24">
                        <Table.Cell>
                          <Link
                            className="font-semibold text-foreground hover:text-accent"
                            href={base + "/" + user.id_usuario}
                          >
                            {user.nombre} {user.apellido}
                          </Link>
                          <p className="mt-1 text-sm text-muted">{user.correo}</p>
                        </Table.Cell>
                        <Table.Cell className="text-sm">{user.rol?.nombre ?? "Sin rol"}</Table.Cell>
                        <Table.Cell>
                          <StatusBadge tone={userTone(user)}>{userStatus(user)}</StatusBadge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-accent hover:bg-default"
                              href={base + "/" + user.id_usuario}
                            >
                              <FiEye aria-hidden="true" /> Ver usuario
                            </Link>
                            {policy.showCompanyLink && user.id_empresa ? (
                              <Link
                                className="inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium text-muted hover:bg-default"
                                href={"/admin/companies/" + user.id_empresa}
                              >
                                Empresa #{user.id_empresa}
                              </Link>
                            ) : null}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          ) : (
            <EmptyState
              title="No hay usuarios en esta página"
              description="Los usuarios registrados aparecerán aquí."
            />
          )}
          <PagePagination last={users.data.meta.last_page} page={page} onChange={setPage} />
        </div>
      )}
    </section>
  );
}
