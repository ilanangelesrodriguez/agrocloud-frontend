/** Adaptar enlaces históricos y aceptar únicamente destinos internos del portal. */
export function notificationDestination(destination: string) {
  if (/^\/lotes\/[1-9]\d*$/.test(destination)) return destination.replace("/lotes/", "/lots/");
  if (destination === "/notificaciones") return "/notifications";
  if (destination === "/suscripcion") return "/settings/subscription";
  if (
    /^\/(?:lots|samplings|inspections)\/[1-9]\d*(?:\/(?:reception|sampling|evidences))?$/.test(
      destination,
    ) ||
    ["/notifications", "/settings/subscription", "/settings/profile"].includes(destination)
  )
    return destination;
  return "/notifications";
}
