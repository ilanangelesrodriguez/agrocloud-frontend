import { z } from "zod";

export const email = z.email("Ingresa un correo electrónico válido.").max(255);
export const password = z
  .string()
  .min(12, "Usa al menos 12 caracteres.")
  .regex(/[a-z]/, "Incluye una letra minúscula.")
  .regex(/[A-Z]/, "Incluye una letra mayúscula.")
  .regex(/[0-9]/, "Incluye un número.")
  .max(255);

export const loginSchema = z.object({
  correo: email,
  password: z.string().min(1, "Ingresa tu contraseña.").max(255),
});
export const forgotSchema = z.object({ correo: email });
export const passwordPair = z
  .object({ password, password_confirmation: z.string() })
  .refine((value) => value.password === value.password_confirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["password_confirmation"],
  });
export const activationSchema = passwordPair.safeExtend({
  user_id: z.coerce.number().int().positive(),
  token: z.string().min(1).max(128),
});
export const resetSchema = passwordPair.safeExtend({
  correo: email,
  token: z.string().min(1).max(255),
});
export const confirmEmailSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  token: z.string().min(1).max(128),
});
export const changeEmailSchema = z.object({
  correo: email,
  current_password: z.string().min(1, "Confirma tu contraseña actual.").max(255),
});

export const identityUserSchema = z
  .object({
    id_usuario: z.number().int(),
    id_empresa: z.number().int().nullable(),
    nombre: z.string(),
    apellido: z.string().nullable(),
    correo: z.string(),
    estado: z.boolean(),
    rol: z.object({ codigo: z.string(), nombre: z.string().optional() }).nullable(),
    permissions: z.array(z.string()),
  })
  .passthrough();
export const identityTokenSchema = z.object({
  token_type: z.literal("Bearer"),
  access_token: z.string().min(30),
  refresh_token: z.string().min(64),
  expires_in: z.number().int().positive(),
});

export type IdentityUser = z.infer<typeof identityUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export function homeForUser(user: IdentityUser): "/admin" | "/dashboard" {
  return user.rol?.codigo === "SUPERADMIN" ? "/admin" : "/dashboard";
}

/** Only allow internal protected destinations. Never return a user-supplied absolute URL. */
export function safeNext(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n?#]/.test(value)) {
    return fallback;
  }
  if (
    /^\/(?:dashboard|admin|producers|lots|settings\/(?:profile|company|users|roles|subscription))(?:\/.*)?$/.test(
      value,
    )
  )
    return value;

  return fallback;
}
