export function requestTone(status: string): "success" | "danger" | "info" | "warning" {
  if (status === "APROBADA") return "success";
  if (status === "RECHAZADA") return "danger";
  if (status === "EN_REVISION") return "info";
  return "warning";
}
