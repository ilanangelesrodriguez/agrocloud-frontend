import { z } from "zod";

const nullableText = z.string().nullish();
const verification = z
  .object({ resultado: nullableText, estado: nullableText, condicion: nullableText })
  .nullish();

export const decisionSchema = z
  .object({
    decision: z.enum(["APROBADA", "RECHAZADA", "EN_REVISION"]),
    motivo: z.string().trim().min(1).max(2000),
    revision_manual: z.boolean().optional(),
    referencia_verificacion: z.string().trim().max(255).optional(),
  })
  .refine(
    (value) => !value.revision_manual || value.decision !== "APROBADA" || value.motivo.length >= 20,
    { message: "Justifica la aprobación manual en al menos 20 caracteres." },
  );

export const requestSchema = z.object({
  id: z.number().int().positive(),
  ruc: z.string(),
  razon_social: z.string(),
  nombre_comercial: nullableText,
  tipo_empresa: nullableText,
  nombre: nullableText,
  apellido: nullableText,
  correo: nullableText,
  telefono: nullableText,
  uso: nullableText,
  estado: z.string(),
  motivo: nullableText,
  sunat_verificacion: verification,
  id_empresa: z.number().int().positive().nullish(),
});

export const requestPageSchema = z.object({
  data: z.array(requestSchema),
  current_page: z.number(),
  last_page: z.number(),
});
export const decisionResponseSchema = z.object({ data: requestSchema });
export type AccessRequest = z.infer<typeof requestSchema>;
