import type { IdentityUser } from "@/lib/auth/schemas";
export function canReadModel(user: IdentityUser | undefined) {
  return Boolean(user?.estado && user.permissions.includes("ia.modelo.ver"));
}
export function canMonitorAi(user: IdentityUser | undefined) {
  return Boolean(
    user?.estado &&
    user.rol?.codigo === "SUPERADMIN" &&
    user.permissions.includes("ia.monitoreo.ver"),
  );
}
export function canReadAiHistory(user: IdentityUser | undefined) {
  return Boolean(
    user?.estado &&
    user.rol?.codigo === "SUPERADMIN" &&
    user.permissions.includes("ia.historial.ver"),
  );
}
