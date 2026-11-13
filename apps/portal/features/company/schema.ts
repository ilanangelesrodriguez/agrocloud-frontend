import { z } from "zod";

import { companyResponseSchema } from "@/features/admin/schema";

export { companyResponseSchema };

const id = z.number().int().positive();
const text = z.string().nullish();
const role = z.object({ id_rol: id, nombre: z.string(), codigo: z.string() });
const permission = z.object({ codigo: z.string(), nombre: text });
const user = z.object({
  id_usuario: id,
  nombre: z.string(),
  apellido: text,
  correo: z.string(),
  cargo: text,
  telefono: text,
  estado: z.boolean(),
  pending_activation: z.boolean(),
  rol: role.nullish(),
});

export const usersSchema = z.object({
  data: z.array(user),
  meta: z.object({ current_page: id, last_page: id }),
});
export const userSchema = z.object({ data: user });
export const rolesSchema = z.object({ data: z.array(role.extend({ permisos: z.array(permission) })) });
export const permissionsSchema = z.object({ data: z.array(permission) });
export const subscriptionSchema = z.object({
  subscription: z.object({ plan: z.string(), estado: z.string(), vence_en: z.string() }).nullable(),
  active: z.boolean(),
  rights: z.array(z.object({
    recurso: z.string(),
    limite: z.number().int().nonnegative(),
    consumido: z.number().int().nonnegative(),
  })),
});
export const invitationSchema = z.object({ message: z.string() });
export const inviteUserSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre.").max(150),
  apellido: z.string().trim().max(150).nullable(),
  correo: z.email("Ingresa un correo válido.").max(255),
  id_rol: id,
  cargo: z.string().trim().max(120).nullable(),
  telefono: z.string().trim().max(30).nullable(),
});
export const editUserSchema = z.object({ id_rol: id.optional(), estado: z.boolean().optional() })
  .refine((value) => value.id_rol !== undefined || value.estado !== undefined, "Selecciona un cambio.");
export type CompanyUser = z.infer<typeof user>;
