import { z } from "zod";
import { roleSchema } from "../users/schema";

const permission = z.object({ codigo: z.string(), nombre: z.string().nullish() });
export const rolesSchema = z.object({
  data: z.array(roleSchema.extend({ permisos: z.array(permission) })),
});
export const permissionsSchema = z.object({ data: z.array(permission) });
