import type { IdentityUser } from "@/lib/auth/schemas";
import { canManageCompany } from "@/features/company/navigation";

export type UserScope = "admin" | "company";
export type UserPolicy = {
  scope: UserScope;
  base: "/admin/users" | "/settings/users";
  title: string;
  actorId?: number;
  canRead: boolean;
  canInvite: boolean;
  canEdit: boolean;
  canChangeStatus: boolean;
  requireCompanyForInvitation: boolean;
  showCompanyLink: boolean;
};

/** Política explícita del administrador: nunca se deriva de un booleano en la vista. */
export function globalUserPolicy(actor: IdentityUser | undefined): UserPolicy {
  const allowed = actor?.rol?.codigo === "SUPERADMIN";
  return {
    scope: "admin",
    base: "/admin/users",
    title: "Usuarios de plataforma",
    actorId: actor?.id_usuario,
    canRead: allowed,
    canInvite: allowed,
    canEdit: allowed,
    canChangeStatus: allowed,
    requireCompanyForInvitation: true,
    showCompanyLink: true,
  };
}

/** Política de un tenant. Los permisos se comprueban también en la API del servidor. */
export function tenantUserPolicy(actor: IdentityUser | undefined): UserPolicy {
  return {
    scope: "company",
    base: "/settings/users",
    title: "Usuarios de la empresa",
    actorId: actor?.id_usuario,
    canRead: canManageCompany(actor, "usuarios.ver"),
    canInvite: canManageCompany(actor, "usuarios.crear"),
    canEdit: canManageCompany(actor, "usuarios.editar"),
    canChangeStatus: canManageCompany(actor, "usuarios.estado"),
    requireCompanyForInvitation: false,
    showCompanyLink: false,
  };
}
