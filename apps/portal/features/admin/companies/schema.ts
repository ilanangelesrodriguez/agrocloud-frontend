import { z } from "zod";

const nullableText = z.string().nullish();
const verification = z
  .object({ resultado: nullableText, estado: nullableText, condicion: nullableText })
  .nullish();

export const companySchema = z.object({
  id_empresa: z.number().int().positive(),
  ruc: z.string(),
  razon_social: z.string(),
  nombre_comercial: nullableText,
  tipo_empresa: nullableText,
  direccion: nullableText,
  correo: nullableText,
  telefono: nullableText,
  estado: z.union([z.string(), z.boolean()]),
  sunat_verificacion: verification,
});
export const companyPageSchema = z.object({
  data: z.array(companySchema),
  meta: z.object({ current_page: z.number(), last_page: z.number() }),
});
export const companyResponseSchema = z.object({ data: companySchema });
