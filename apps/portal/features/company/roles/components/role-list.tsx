"use client";

import { useState } from "react";
import { Accordion, Input, Label, TextField, FieldError } from "@heroui/react";
import { FiCheck, FiShield, FiSearch } from "react-icons/fi";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCompanyPermissions, useCompanyRoles } from "../hooks";

type Permission = { codigo: string; nombre?: string | null };
const moduleNames: Record<string, string> = {
  dashboard: "Panel",
  empresa: "Empresa",
  usuarios: "Usuarios",
  productores: "Productores",
  lotes: "Lotes",
  muestreos: "Muestreos",
  inspecciones: "Inspecciones",
  evidencias: "Evidencias",
  suscripcion: "Suscripción",
  roles: "Roles",
  recepciones: "Recepciones",
};

function PermissionGroups({ permissions }: { permissions: Permission[] }) {
  const groups = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const key = permission.codigo.split(".")[0];
    groups.set(key, [...(groups.get(key) ?? []), permission]);
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from(groups, ([module, entries]) => (
        <section key={module} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            {moduleNames[module] ?? module.replaceAll("_", " ")}
          </h3>
          <ul className="space-y-2">
            {entries.map((permission) => (
              <li key={permission.codigo} className="flex items-start gap-2 text-sm">
                <FiCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{permission.nombre ?? permission.codigo}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function CompanyRoles() {
  const roles = useCompanyRoles();
  const permissions = useCompanyPermissions();
  const [search, setSearch] = useState("");
  const failed = roles.error ?? permissions.error;
  const term = search.trim().toLocaleLowerCase("es");
  const matches = (permission: Permission) =>
    [permission.nombre, permission.codigo].join(" ").toLocaleLowerCase("es").includes(term);
  const available = roles.data?.data ?? [];
  const visible = available.filter(
    (role) => role.nombre.toLocaleLowerCase("es").includes(term) || role.permisos.some(matches),
  );
  const ownPermissions = permissions.data?.data ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Roles y permisos"
        description="Consulta los accesos de cada rol y los permisos habilitados para tu cuenta."
      />
      {failed ? (
        <ErrorState
          error={failed}
          retry={() => void Promise.all([roles.refetch(), permissions.refetch()])}
        />
      ) : roles.isPending || permissions.isPending ? (
        <LoadingState label="Cargando roles y permisos" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted">Roles disponibles</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{available.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted">Permisos de tu cuenta</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{ownPermissions.length}</p>
            </div>
          </div>
          <TextField variant="secondary" value={search} onChange={setSearch} className="max-w-lg">
            <Label className="flex items-center gap-2">
              <FiSearch aria-hidden="true" /> Buscar rol o permiso
            </Label>
            <Input
              variant="secondary"
              className="w-full"
              placeholder="Ej. recepción, usuarios o lotes"
            />
            <FieldError />
          </TextField>
          <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Accesos por rol</h2>
              {visible.length ? (
                <Accordion className="overflow-hidden rounded-2xl border border-border bg-surface">
                  {visible.map((role) => (
                    <Accordion.Item key={role.id_rol} id={String(role.id_rol)}>
                      <Accordion.Heading>
                        <Accordion.Trigger className="gap-3 px-5 py-5">
                          <FiShield aria-hidden="true" className="size-5 shrink-0 text-accent" />
                          <span className="min-w-0 flex-1 text-left">
                            <span className="block text-sm font-semibold">{role.nombre}</span>
                            <span className="mt-1 block text-xs font-normal text-muted">
                              {role.permisos.length} permisos asignados
                            </span>
                          </span>
                          <Accordion.Indicator />
                        </Accordion.Trigger>
                      </Accordion.Heading>
                      <Accordion.Panel>
                        <Accordion.Body className="border-t border-border px-5 py-5">
                          {role.permisos.length ? (
                            <PermissionGroups permissions={role.permisos} />
                          ) : (
                            <p className="text-sm text-muted">
                              Este rol no tiene permisos asignados.
                            </p>
                          )}
                        </Accordion.Body>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <EmptyState
                  title="No se encontraron roles"
                  description="Prueba con otro nombre o permiso."
                />
              )}
            </section>
            <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Tus permisos efectivos</h2>
              <p className="mb-6 mt-1 text-sm text-muted">
                Acciones que puedes realizar con tu sesión actual.
              </p>
              {ownPermissions.filter(matches).length ? (
                <PermissionGroups permissions={ownPermissions.filter(matches)} />
              ) : (
                <p className="text-sm text-muted">No hay permisos que coincidan con la búsqueda.</p>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
