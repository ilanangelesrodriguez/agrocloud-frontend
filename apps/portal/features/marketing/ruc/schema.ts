import { z } from "zod";

export const rucSchema = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "El RUC debe contener exactamente 11 dígitos.");

export const rucLookupSchema = z.object({
  data: z.object({
    ruc: rucSchema,
    resultado: z.enum(["verificado", "pendiente", "no_encontrado"]),
    mensaje: z.string(),
    razon_social: z.string().nullish(),
    estado: z.string().nullish(),
    condicion: z.string().nullish(),
  }),
});
