import { z } from "zod";

export { companyResponseSchema } from "@/features/admin/companies/schema";
export const editCompanySchema = z
  .object({
    razon_social: z.string().trim().min(1).max(200),
    nombre_comercial: z.string().trim().min(1).max(150),
    tipo_empresa: z.string().trim().max(80).nullable(),
    direccion: z.string().trim().max(250).nullable(),
    telefono: z.string().trim().max(30).nullable(),
    correo: z.email().max(255).nullable(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Modifica al menos un dato.");
