import { z } from "zod";

// Nombres y límites alineados con ms-identity/app/Http/Requests/AccessRequest.php.
export const accessRequestSchema = z.object({
  ruc: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "El RUC debe contener exactamente 11 dígitos."),
  razon_social: z.string().trim().min(3, "Ingresa la razón social.").max(200),
  nombre_comercial: z.string().trim().min(2, "Ingresa el nombre comercial.").max(150),
  tipo_empresa: z.string().trim().min(2, "Selecciona el tipo de empresa.").max(80),
  nombre: z.string().trim().min(2, "Ingresa los nombres del representante.").max(100),
  apellido: z.string().trim().min(2, "Ingresa los apellidos del representante.").max(100),
  correo: z.email("Ingresa un correo electrónico válido.").max(255),
  telefono: z.string().trim().min(6, "Ingresa un número telefónico válido.").max(30),
  uso: z.string().trim().min(20, "Describe tu operación en al menos 20 caracteres.").max(4000),
});

export const clientAccessFormSchema = accessRequestSchema.extend({
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
