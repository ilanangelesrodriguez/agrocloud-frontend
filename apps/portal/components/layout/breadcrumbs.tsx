"use client";

import { Breadcrumbs } from "@heroui/react";

function nameFor(segment: string, parent: string): string {
  if (/^[0-9]+$/.test(segment)) return "Registro #" + segment;

  const names: Record<string, string> = {
    admin: "Plataforma",
    "access-requests": "Solicitudes",
    companies: "Empresas",
    users: "Usuarios",
    plans: "Planes",
    dashboard: "Panel",
    producers: "Productores",
    lots: "Lotes",
    samplings: "Muestreos",
    quality: "Calidad",
    incidents: "Incidencias",
    reports: "Reportes",
    production: "Producción",
    inspections: "Inspecciones",
    notifications: "Notificaciones",
    evidences: "Evidencias",
    reception: "Recepción",
    sampling: "Muestreo",
    settings: "Configuración",
    profile: "Mi perfil",
    company: "Empresa",
    roles: "Roles y permisos",
    catalogs: "Maestros",
    "sampling-procedures": "Procedimientos de muestreo",
    producto: "Productos",
    variedad: "Variedades",
    unidad: "Unidades de medida",
    metodo: "Métodos de muestreo",
    defecto: "Defectos",
    categoria: "Categorías comerciales",
    motivo: "Motivos de rechazo",
    subscription: "Suscripción",
    new: parent === "users" ? "Invitar usuario" : "Nuevo registro",
    edit: "Editar",
  };

  return names[segment] ?? "Detalle";
}

type Crumb = { href?: string; label: string };

export function crumbsFor(pathname: string, admin: boolean): Crumb[] {
  const home = admin ? "/admin" : "/dashboard";
  const rootLabel = admin ? "Plataforma" : "Panel";
  if (pathname === home) return [{ label: rootLabel }];

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ href: home, label: rootLabel }];

  if (parts[0] === "settings") {
    crumbs.push({ href: "/settings/profile", label: "Configuración" });
    parts.shift();
  } else if (parts[0] === "admin") {
    parts.shift();
  }

  let path = pathname.startsWith("/settings/")
    ? "/settings"
    : pathname.startsWith("/admin")
      ? "/admin"
      : "";

  for (let index = 0; index < parts.length; index++) {
    const segment = parts[index];
    path += "/" + segment;
    // Las pantallas de muestreo e inspección solo tienen detalle; no hay listado.
    const linkable =
      index < parts.length - 1 &&
      path !== "/settings" &&
      path !== "/samplings" &&
      path !== "/inspections";
    crumbs.push({
      href: linkable ? path : undefined,
      label: nameFor(segment, parts[index - 1] ?? ""),
    });
  }

  return crumbs.map((crumb, index) =>
    index === crumbs.length - 1 ? { label: crumb.label } : crumb,
  );
}

export function AppBreadcrumbs({ pathname, admin }: { pathname: string; admin: boolean }) {
  const crumbs = crumbsFor(pathname, admin);

  return (
    <Breadcrumbs aria-label="Ruta de navegación" className="min-w-0 text-sm">
      {crumbs.map((crumb, index) => (
        <Breadcrumbs.Item
          className={index < crumbs.length - 1 ? "hidden sm:inline-flex" : "min-w-0"}
          href={crumb.href}
          key={index}
        >
          <span className="block max-w-36 truncate sm:max-w-56">{crumb.label}</span>
        </Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  );
}
