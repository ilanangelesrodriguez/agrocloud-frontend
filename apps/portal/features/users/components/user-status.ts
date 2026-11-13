import type { CompanyUser } from "@/features/company/users/schema";

export function userStatus(user: CompanyUser) {
  if (user.pending_activation) return "Invitación pendiente";
  return user.estado ? "Activo" : "Inactivo";
}
export function userTone(user: CompanyUser): "success" | "danger" | "info" {
  return user.pending_activation ? "info" : user.estado ? "success" : "danger";
}
