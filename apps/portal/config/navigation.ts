import type { IdentityUser } from "@/lib/auth/schemas";

import { canAccessSetting, canManageCompany, settingsLinks } from "@/features/company/navigation";

export type NavigationIcon =
  | "dashboard"
  | "producers"
  | "lots"
  | "requests"
  | "companies"
  | "users"
  | "plans"
  | "profile"
  | "roles"
  | "subscription"
  | "notifications"
  | "sampling"
  | "inspection"
  | "quality"
  | "reports"
  | "production"
  | "ai"
  | "incidents";

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

const adminItems: NavigationItem[] = [
  { href: "/admin", label: "Resumen de plataforma", icon: "dashboard" },
  { href: "/admin/access-requests", label: "Solicitudes", icon: "requests" },
  { href: "/admin/companies", label: "Empresas", icon: "companies" },
  { href: "/admin/users", label: "Usuarios", icon: "users" },
  { href: "/admin/ai", label: "Inteligencia artificial", icon: "ai" },
  { href: "/admin/plans", label: "Planes y ofertas", icon: "plans" },
];

const companyItems: (NavigationItem & { permission?: string })[] = [
  { href: "/dashboard", label: "Panel principal", icon: "dashboard" },
  {
    href: "/producers",
    label: "Productores",
    icon: "producers",
    permission: "productores.ver",
  },
  { href: "/lots", label: "Lotes", icon: "lots", permission: "lotes.ver" },
  { href: "/samplings", label: "Muestreos", icon: "sampling", permission: "muestreos.ver" },
  {
    href: "/inspections",
    label: "Inspecciones",
    icon: "inspection",
    permission: "inspecciones.ver",
  },
  { href: "/quality", label: "Calidad", icon: "quality", permission: "calidad.clasificar" },
  {
    href: "/incidents",
    label: "Incidencias",
    icon: "incidents",
    permission: "incidencias.ver",
  },
  { href: "/reports", label: "Reportes", icon: "reports", permission: "reportes.operativos" },
  {
    href: "/reports/ai",
    label: "IA de mi empresa",
    icon: "ai",
    permission: "ia.reportes.ver",
  },
  { href: "/production", label: "Producción", icon: "production", permission: "produccion.ver" },
];

const settingsIcons: Record<(typeof settingsLinks)[number]["href"], NavigationIcon> = {
  "/settings/company": "companies",
  "/settings/users": "users",
  "/settings/roles": "roles",
  "/settings/catalogs": "lots",
  "/settings/sampling-procedures": "requests",
  "/settings/subscription": "subscription",
  "/settings/notifications": "notifications",
};

export function navigationFor(user: IdentityUser): NavigationSection[] {
  if (user.rol?.codigo === "SUPERADMIN") {
    return [
      { title: "Plataforma", items: adminItems },
      {
        title: "Cuenta",
        items: [{ href: "/settings/profile", label: "Mi perfil", icon: "profile" }],
      },
    ];
  }

  const agricultural = companyItems
    .filter(({ permission }) => canManageCompany(user, permission))
    .map(({ href, label, icon }) => ({ href, label, icon }));

  const settings: NavigationItem[] = settingsLinks
    .filter(({ href }) => href !== "/settings/notifications")
    .filter((setting) => canAccessSetting(user, setting))
    .map(({ href, label }) => ({ href, label, icon: settingsIcons[href] }));

  const sections: NavigationSection[] = [
    { title: "General", items: agricultural.filter((item) => item.href === "/dashboard") },
    {
      title: "Operaciones",
      items: agricultural.filter(
        (item) => !["/dashboard", "/reports", "/reports/ai"].includes(item.href),
      ),
    },
    {
      title: "Análisis y reportes",
      items: agricultural.filter((item) => ["/reports", "/reports/ai"].includes(item.href)),
    },
    { title: "Administración", items: settings },
    {
      title: "Mi cuenta",
      items: [
        { href: "/settings/profile", label: "Mi perfil", icon: "profile" },
        { href: "/notifications", label: "Notificaciones", icon: "notifications" },
        { href: "/settings/notifications", label: "Preferencias de avisos", icon: "notifications" },
      ],
    },
  ];

  return sections.filter((section) => section.items.length > 0);
}

/**
 * "Resumen" y "Panel principal" solo se marcan activos en su ruta exacta.
 * Los módulos conservan su estado activo en subrutas como /lots/12.
 */
export function isActiveRoute(pathname: string, href: string): boolean {
  if (
    href === "/admin" ||
    href === "/dashboard" ||
    href === "/settings/profile" ||
    href === "/reports"
  ) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(href + "/");
}
