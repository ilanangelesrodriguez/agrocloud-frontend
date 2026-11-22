"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Table, Dropdown, Label } from "@heroui/react";
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";
import { useQueries } from "@tanstack/react-query";
import { getCompany } from "@/features/admin/companies/api";
import { AdminFilterBar, matchesSearch } from "@/features/admin/components/admin-filter-bar";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const companyIds =
    policy.showCompanyLink && policy.canRead
      ? Array.from(
          new Set(
            (users.data?.data ?? [])
              .map((user) => user.id_empresa)
              .filter((id): id is number => !!id),
          ),
        )
      : [];
  const companyQueries = useQueries({
    queries: companyIds.map((id) => ({
      queryKey: ["admin", "companies", "name", id],
      queryFn: ({ signal }: { signal: AbortSignal }) => getCompany(String(id), signal),
      staleTime: 300000,
      retry: false,
    })),
  });
  const companyNames = new Map(
    companyIds.map((id, index) => [
      id,
      companyQueries[index]?.data?.data.nombre_comercial ||
        companyQueries[index]?.data?.data.razon_social ||
        "Empresa #" + id,
    ]),
  );
  const rows = (users.data?.data ?? []).filter(
    (user) =>
      matchesSearch([user.nombre, user.apellido, user.correo], search) &&
      (status === "all" || userStatus(user) === status) &&
      (!role || user.rol?.codigo === role) &&
      (!companyFilter || String(user.id_empresa) === companyFilter),
  );
  const roleOptions = Array.from(
    new Map(
      (users.data?.data ?? []).flatMap((user) =>
        user.rol
          ? [[user.rol.codigo, { id: user.rol.codigo, name: user.rol.nombre }] as const]
          : [],
      ),
    ).values(),
  );
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
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        onClear={() => {
          setRole("");
          setCompanyFilter("");
        }}
        placeholder="Nombre, apellido o correo"
        states={[
          { id: "all", label: "Todos" },
          { id: "Activo", label: "Activos" },
          { id: "Invitación pendiente", label: "Invitaciones pendientes" },
          { id: "Inactivo", label: "Inactivos" },
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <CatalogSelect
            label="Rol"
            value={role}
            onChange={setRole}
            optional
            emptyLabel="Todos los roles"
            items={roleOptions}
          />
          {policy.showCompanyLink ? (
            <CatalogSelect
              label="Empresa"
              value={companyFilter}
              onChange={setCompanyFilter}
              optional
              emptyLabel="Todas las empresas"
              items={companyIds.map((id) => ({ id: String(id), name: companyNames.get(id)! }))}
            />
          ) : null}
        </div>
      </AdminFilterBar>
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
          {rows.length ? (
            <Table className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <Table.ScrollContainer>
                <Table.Content aria-label="Usuarios registrados">
                  <Table.Header>
                    <Table.Column isRowHeader>Usuario</Table.Column>
                    <Table.Column>Rol</Table.Column>
                    <Table.Column>Estado</Table.Column>
                    <Table.Column>Acciones</Table.Column>
                  </Table.Header>
                  <Table.Body items={rows}>
                    {(user) => (
                      <Table.Row id={user.id_usuario} className="h-24">
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10 shrink-0">
                              <Avatar.Image src={user.foto_perfil_url ?? undefined} alt="" />
                              <Avatar.Fallback>
                                {[user.nombre, user.apellido]
                                  .filter(Boolean)
                                  .map((value) => value!.trim()[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </Avatar.Fallback>
                            </Avatar>
                            <div className="min-w-0">
                              <Link
                                className="font-semibold text-foreground hover:text-accent"
                                href={base + "/" + user.id_usuario}
                              >
                                {user.nombre} {user.apellido}
                              </Link>
                              <p className="mt-1 break-all text-sm text-muted">{user.correo}</p>
                              {policy.showCompanyLink && user.id_empresa ? (
                                <p className="mt-1 max-w-xs break-words text-xs text-muted">
                                  {companyNames.get(user.id_empresa) ??
                                    "Empresa #" + user.id_empresa}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-sm">{user.rol?.nombre ?? "Sin rol"}</Table.Cell>
                        <Table.Cell>
                          <StatusBadge tone={userTone(user)}>{userStatus(user)}</StatusBadge>
                        </Table.Cell>
                        <Table.Cell>
                          <Dropdown>
                            <Button
                              isIconOnly
                              variant="tertiary"
                              aria-label={"Acciones de " + user.nombre}
                            >
                              <FiMoreHorizontal aria-hidden="true" />
                            </Button>
                            <Dropdown.Popover>
                              <Dropdown.Menu
                                aria-label="Acciones del usuario"
                                onAction={(key) =>
                                  router.push(
                                    key === "company"
                                      ? "/admin/companies/" + user.id_empresa
                                      : base + "/" + user.id_usuario,
                                  )
                                }
                              >
                                <Dropdown.Item id="detail" textValue="Ver usuario">
                                  <Label>Ver usuario</Label>
                                </Dropdown.Item>
                                {policy.showCompanyLink && user.id_empresa ? (
                                  <Dropdown.Item
                                    id="company"
                                    textValue={companyNames.get(user.id_empresa) ?? "Ver empresa"}
                                  >
                                    <Label>
                                      {companyNames.get(user.id_empresa) ?? "Ver empresa"}
                                    </Label>
                                  </Dropdown.Item>
                                ) : null}
                              </Dropdown.Menu>
                            </Dropdown.Popover>
                          </Dropdown>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          ) : (
            <EmptyState
              title="Sin usuarios para esta vista"
              description="Cambia los filtros o consulta otra página para revisar otros usuarios."
            />
          )}
          <PagePagination last={users.data.meta.last_page} page={page} onChange={setPage} />
        </div>
      )}
    </section>
  );
}
