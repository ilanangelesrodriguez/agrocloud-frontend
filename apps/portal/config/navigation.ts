import type { IdentityUser } from "@/lib/auth/schemas";

import { canManageCompany, settingsLinks } from "@/features/company/navigation";

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
  | "subscription";

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
];

const settingsIcons: Record<(typeof settingsLinks)[number]["href"], NavigationIcon> = {
  "/settings/company": "companies",
  "/settings/users": "users",
  "/settings/roles": "roles",
  "/settings/subscription": "subscription",
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
    .filter(({ permission }) => canManageCompany(user, permission))
    .map(({ href, label }) => ({ href, label, icon: settingsIcons[href] }));

  const sections: NavigationSection[] = [
    { title: "Operaciones", items: agricultural },
    {
      title: "Cuenta y empresa",
      items: [{ href: "/settings/profile", label: "Mi perfil", icon: "profile" }, ...settings],
    },
  ];

  return sections.filter((section) => section.items.length > 0);
}

/**
 * "Resumen" y "Panel principal" solo se marcan activos en su ruta exacta.
 * Los módulos conservan su estado activo en subrutas como /lots/12.
 */
export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/dashboard" || href === "/settings/profile") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(href + "/");
}
