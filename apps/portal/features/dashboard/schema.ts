import { z } from "zod";
export const setupSchema = z.object({
  checks: z.array(
    z.object({ key: z.string(), label: z.string(), done: z.boolean(), href: z.string() }),
  ),
});
