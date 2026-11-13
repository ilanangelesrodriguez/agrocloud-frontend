import { z } from "zod";

export const subscriptionSchema = z.object({
  subscription: z.object({ plan: z.string(), estado: z.string(), vence_en: z.string() }).nullable(),
  active: z.boolean(),
  rights: z.array(
    z.object({
      recurso: z.string(),
      limite: z.number().int().nonnegative(),
      consumido: z.number().int().nonnegative(),
    }),
  ),
});
