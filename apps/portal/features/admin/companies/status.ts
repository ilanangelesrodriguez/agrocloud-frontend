export function companyStatus(status: string | boolean) {
  if (typeof status === "string") return status;
  return status ? "Activa" : "Inactiva";
}

export function companyTone(status: string | boolean): "success" | "danger" | "warning" {
  if (typeof status === "boolean") return status ? "success" : "danger";
  const value = status.toUpperCase();
  if (["ACTIVA", "ACTIVO", "ACTIVE", "APROBADA"].includes(value)) return "success";
  if (["INACTIVA", "INACTIVO", "SUSPENDIDA"].includes(value)) return "danger";
  return "warning";
}
