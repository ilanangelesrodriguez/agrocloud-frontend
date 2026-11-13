"use client";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCompanyPermissions, useCompanyRoles } from "../hooks";

/** Los roles y los permisos se leen desde Identity, sin modificar sus contratos. */
export function CompanyRoles() {
  const roles = useCompanyRoles();
  const permissions = useCompanyPermissions();
  const failed = roles.error ?? permissions.error;

  return (
    <section className="space-y-4">
      <PageHeader title="Roles y permisos" />
      {failed ? (
        <ErrorState
          error={failed}
          retry={() => void Promise.all([roles.refetch(), permissions.refetch()])}
        />
      ) : roles.isPending || permissions.isPending ? (
        <LoadingState label="Cargando roles y permisos" />
      ) : (
        <>
          <h2 className="text-xl font-semibold">Roles disponibles</h2>
          {roles.data?.data.length ? (
            roles.data.data.map((role) => (
              <details
                key={role.id_rol}
                className="rounded-card border border-border bg-surface p-4"
              >
                <summary className="cursor-pointer">{role.nombre}</summary>
                <ul className="mt-2 space-y-1">
                  {role.permisos.map((permission) => (
                    <li key={permission.codigo}>{permission.nombre ?? permission.codigo}</li>
                  ))}
                </ul>
              </details>
            ))
          ) : (
            <EmptyState
              title="No hay roles disponibles"
              description="Consulta al administrador de la empresa."
            />
          )}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Permisos de tu cuenta</h2>
            <ul>
              {(permissions.data?.data ?? []).map((permission) => (
                <li key={permission.codigo}>{permission.nombre ?? permission.codigo}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </section>
  );
}
