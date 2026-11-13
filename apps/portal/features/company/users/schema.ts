import { z } from "zod";

const id = z.number().int().positive();
const nullableText = z.string().nullish();
export const roleSchema = z.object({ id_rol: id, nombre: z.string(), codigo: z.string() });
const user = z.object({
  id_usuario: id,
  id_empresa: id.nullish(),
  nombre: z.string(),
  apellido: nullableText,
  correo: z.string(),
  cargo: nullableText,
  telefono: nullableText,
  estado: z.boolean(),
  pending_activation: z.boolean(),
  rol: roleSchema.nullish(),
});

export const usersSchema = z.object({
  data: z.array(user),
  meta: z.object({ current_page: id, last_page: id }),
});
export const userSchema = z.object({ data: user });
export const invitationSchema = z.object({ message: z.string() });
export const inviteUserSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre.").max(150),
  apellido: z.string().trim().max(150).nullable(),
  correo: z.email("Ingresa un correo válido.").max(255),
  id_rol: id,
  cargo: z.string().trim().max(120).nullable(),
  telefono: z.string().trim().max(30).nullable(),
});
export const editUserSchema = inviteUserSchema
  .omit({ correo: true })
  .partial()
  .extend({ estado: z.boolean().optional() })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    "Selecciona un cambio.",
  );
export type CompanyUser = z.infer<typeof user>;
