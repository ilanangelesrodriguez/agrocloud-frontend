import type { IdentityUser } from "@/lib/auth/schemas";

export const settingsLinks = [
  { href: "/settings/company", label: "Empresa", permission: "empresa.ver" },
  { href: "/settings/users", label: "Usuarios", permission: "usuarios.ver" },
  { href: "/settings/roles", label: "Roles y permisos", permission: "usuarios.ver" },
  { href: "/settings/catalogs", label: "Maestros", permission: "empresa.editar" },
  { href: "/settings/sampling-procedures", label: "Procedimientos", permission: "empresa.editar" },
  { href: "/settings/subscription", label: "Suscripción", permission: "suscripciones.ver" },
] as const;

export function canManageCompany(user: IdentityUser | undefined, permission?: string) {
  return Boolean(
    user?.id_empresa &&
    user.rol?.codigo !== "SUPERADMIN" &&
    (!permission || user.permissions.includes(permission)),
  );
}

export function canReadProcedures(user: IdentityUser | undefined) {
  return (
    canManageCompany(user) &&
    ["empresa.editar", "muestreos.ver", "muestreos.crear"].some((permission) =>
      user?.permissions.includes(permission),
    )
  );
}

export function canAccessSetting(
  user: IdentityUser | undefined,
  setting: (typeof settingsLinks)[number],
) {
  return setting.href === "/settings/sampling-procedures"
    ? canReadProcedures(user)
    : canManageCompany(user, setting.permission);
}
