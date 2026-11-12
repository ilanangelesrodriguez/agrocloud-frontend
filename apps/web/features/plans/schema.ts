import { z } from "zod";

export const publicOffersSchema = z.object({
  data: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      description: z.string().optional(),
      currency: z.literal("PEN"),
      amount_cents: z.number().int().nonnegative(),
      duration_days: z.number().int().nonnegative(),
      available: z.boolean(),
      limits: z.object({
        usuarios: z.number().int().nonnegative(),
        lotes: z.number().int().nonnegative(),
        analisis_ia: z.number().int().nonnegative(),
      }),
    }),
  ),
});
