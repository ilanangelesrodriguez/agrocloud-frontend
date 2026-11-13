import type { IdentityUser } from "@/lib/auth/schemas";

export const settingsLinks = [
  { href: "/settings/company", label: "Empresa", permission: "empresa.ver" },
  { href: "/settings/users", label: "Usuarios", permission: "usuarios.ver" },
  { href: "/settings/roles", label: "Roles y permisos", permission: "usuarios.ver" },
  { href: "/settings/subscription", label: "Suscripción", permission: "suscripciones.ver" },
] as const;

export function canManageCompany(user: IdentityUser | undefined, permission?: string) {
  return Boolean(
    user?.id_empresa &&
    user.rol?.codigo !== "SUPERADMIN" &&
    (!permission || user.permissions.includes(permission)),
  );
}
