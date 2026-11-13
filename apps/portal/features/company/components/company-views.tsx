"use client";

import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

import { adminRequest } from "@/features/admin/api";
import { companyResponseSchema, permissionsSchema, rolesSchema, subscriptionSchema } from "../schema";

export function CompanyReadView({ view }: { view: "company" | "roles" | "subscription" }) {
  const title = { company: "Mi empresa", roles: "Roles y permisos", subscription: "Suscripción" }[view];
  const company = useQuery({
    queryKey: ["company", "profile"],
    queryFn: ({ signal }) => adminRequest("profile", companyResponseSchema, { signal }, "company"),
    enabled: view === "company",
  });
  const roles = useQuery({
    queryKey: ["company", "roles"],
    queryFn: ({ signal }) => adminRequest("roles", rolesSchema, { signal }, "company"),
    enabled: view === "roles",
  });
  const permissions = useQuery({
    queryKey: ["company", "permissions"],
    queryFn: ({ signal }) => adminRequest("permissions", permissionsSchema, { signal }, "company"),
    enabled: view === "roles",
  });
  const plan = useQuery({
    queryKey: ["company", "subscription"],
    queryFn: ({ signal }) => adminRequest("subscription", subscriptionSchema, { signal }, "company"),
    enabled: view === "subscription",
  });
  const queries = view === "roles" ? [roles, permissions] : [view === "company" ? company : plan];
  const error = queries.find((query) => query.isError)?.error;
  const profile = company.data?.data;
  const subscription = plan.data?.subscription;

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {error ? (
        <div className="space-y-3">
          <p role="alert">{error.message}</p>
          <Button variant="secondary" onPress={() => { void Promise.all(queries.map((query) => query.refetch())); }}>Reintentar</Button>
        </div>
      ) : queries.some((query) => query.isPending) ? <p role="status">Cargando…</p> : null}
      {view === "company" && profile ? (
        <dl className="grid gap-4 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
          {[
            ["Razón social", profile.razon_social], ["RUC", profile.ruc],
            ["Nombre comercial", profile.nombre_comercial], ["Tipo", profile.tipo_empresa],
            ["Dirección", profile.direccion], ["Correo", profile.correo], ["Teléfono", profile.telefono],
            ["Estado", typeof profile.estado === "boolean" ? (profile.estado ? "Activa" : "Inactiva") : profile.estado],
          ].map(([label, value]) => (
            <div key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words">{value ?? "—"}</dd></div>
          ))}
        </dl>
      ) : null}
      {view === "roles" && roles.data ? (
        <>
          <h2 className="text-xl font-semibold">Roles disponibles</h2>
          {roles.data.data.map((role) => (
            <details key={role.id_rol} className="rounded-card border border-border bg-surface p-4">
              <summary className="cursor-pointer">{role.nombre}</summary>
              <ul className="mt-2 space-y-1">
                {role.permisos.map((permission) => <li key={permission.codigo}>{permission.nombre ?? permission.codigo}</li>)}
              </ul>
            </details>
          ))}
          {permissions.data ? (
            <section className="space-y-2">
              <h2 className="text-xl font-semibold">Permisos de tu cuenta</h2>
              <ul>{permissions.data.data.map((permission) => <li key={permission.codigo}>{permission.nombre ?? permission.codigo}</li>)}</ul>
            </section>
          ) : null}
        </>
      ) : null}
      {view === "subscription" && plan.data ? (
        subscription ? (
          <div className="space-y-4 rounded-card border border-border bg-surface p-5">
            <h2 className="text-xl font-semibold">{subscription.plan}</h2>
            <p>{plan.data.active ? "Vigente" : "Sin vigencia"} · {subscription.estado}</p>
            <p>Vencimiento: {subscription.vence_en.slice(0, 10)}</p>
            <ul className="space-y-2">
              {plan.data.rights.map((right) => (
                <li key={right.recurso} className="flex flex-wrap justify-between gap-2">
                  <span>{right.recurso === "analisis_ia" ? "Análisis IA" : right.recurso}</span>
                  <span className="tabular-nums">{right.consumido} de {right.limite} utilizados</span>
                </li>
              ))}
            </ul>
          </div>
        ) : <p>Tu empresa no tiene una suscripción asignada.</p>
      ) : null}
    </section>
  );
}
