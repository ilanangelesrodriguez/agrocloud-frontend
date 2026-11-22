import { z } from "zod";

import { rucSchema } from "@/features/marketing/ruc/schema";

// Nombres y límites alineados con ms-identity/app/Http/Requests/AccessRequest.php.
// Solo cambiamos el texto visible de validación; el contrato se mantiene.
const accessRequestFields = z.object({
  selected_offer_key: z
    .string()
    .regex(/^[A-Za-z0-9_-]{1,60}$/)
    .nullish(),
  ruc: rucSchema,
  razon_social: z.string().trim().min(3, "Ingresa la razón social.").max(200),
  nombre_comercial: z.string().trim().min(2, "Ingresa el nombre comercial.").max(150),
  tipo_empresa: z.string().trim().min(2, "Selecciona la actividad principal.").max(80),
  nombre: z.string().trim().min(2, "Ingresa los nombres del representante.").max(100),
  apellido: z.string().trim().min(2, "Ingresa los apellidos del representante.").max(100),
  correo: z.email("Ingresa un correo electrónico válido.").max(255),
  telefono: z.string().trim().min(6, "Ingresa un número telefónico válido.").max(30),
  uso: z.string().trim().min(20, "Describe tu operación en al menos 20 caracteres.").max(4000),
});

export const accessRequestReferenceSchema = z.uuid();
export const accessRequestSelectionSchema = z.object({
  type: z.enum(["FREE", "PAID"]),
  name: z.string().min(1).max(120),
});

export const accessRequestSchema = accessRequestFields.extend({
  privacy_accepted: z.literal(true),
  privacy_version: z.string().trim().min(1).max(80),
});

export const clientAccessFormSchema = accessRequestFields.extend({
  consentimiento: z
    .boolean()
    .refine((v) => v, "Debes aceptar el tratamiento de datos para enviar la solicitud."),
});
export type AccessRequestPayload = z.infer<typeof accessRequestSchema>;
export type AccessFormValues = z.infer<typeof clientAccessFormSchema>;
export const companyTypes = [
  "Empresa productora",
  "Centro de acopio",
  "Planta de empaque",
  "Empresa agroexportadora",
  "Otra actividad agrícola",
];
