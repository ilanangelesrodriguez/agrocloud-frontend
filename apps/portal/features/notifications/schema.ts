import { z } from "zod";

export const optionalKinds = [
  "LOTE_REGISTRADO",
  "MUESTREO_REGISTRADO",
  "LOTE_RECIBIDO",
  "INSPECCION_ASIGNADA",
  "INSPECCION_VALIDADA",
  "DICTAMEN_APROBADO",
] as const;
export const kindLabels: Record<string, string> = {
  MUESTREO_REGISTRADO: "Muestreos pendientes de inspección",
  LOTE_REGISTRADO: "Nuevos lotes",
  LOTE_RECIBIDO: "Recepciones completadas",
  INSPECCION_ASIGNADA: "Inspecciones asignadas",
  INSPECCION_VALIDADA: "Inspecciones validadas",
  DICTAMEN_APROBADO: "Dictámenes aprobados",
};
export const notification = z.object({
  id: z.uuid(),
  cursor: z.string(),
  kind: z.string(),
  title: z.string(),
  message: z.string(),
  destination: z.string(),
  priority: z.string(),
  category: z.string(),
  read_at: z.string().nullable(),
  created_at: z.string(),
});
export const inboxResponse = z.object({
  data: z.array(notification),
  nextCursor: z.string().nullable(),
});
export const unreadResponse = z.object({ unreadCount: z.number().int().nonnegative() });
export const readResponse = z.object({ read: z.literal(true) });
export const readAllResponse = z.object({ updated: z.number().int().nonnegative() });
export const preferencesInput = z
  .object({
    mutedKinds: z.array(z.enum(optionalKinds)).max(optionalKinds.length),
    emailEnabled: z.boolean(),
  })
  .refine(
    (value) => new Set(value.mutedKinds).size === value.mutedKinds.length,
    "Hay preferencias duplicadas.",
  );
export const preferencesResponse = z.object({
  mutedKinds: z.array(z.enum(optionalKinds)),
  emailEnabled: z.boolean(),
  optionalKinds: z.array(z.enum(optionalKinds)),
  criticalSecurityCannotBeMuted: z.boolean(),
});
export type Notification = z.infer<typeof notification>;
export type NotificationPreferences = z.infer<typeof preferencesResponse>;
