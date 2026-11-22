import type { NextRequest } from "next/server";
import { z } from "zod";
import { identityUserSchema } from "@/lib/auth/schemas";
import { authorizedIdentity } from "@/lib/auth/authorized-identity";
import { parseJson, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";
const input = z
  .object({
    nombre: z.string().trim().min(2).max(150).optional(),
    apellido: z.string().trim().max(150).nullable().optional(),
    telefono: z
      .string()
      .trim()
      .max(30)
      .regex(/^[+0-9 ()-]*$/)
      .nullable()
      .optional(),
  })
  .strict();

export async function PATCH(request: NextRequest) {
  const body = await parseJson(request);
  if (!body.ok) return body.response;
  const parsed = input.safeParse(body.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0)
    return reply({ message: "Revisa los datos personales." }, 422);
  return authorizedIdentity(request, () => "/auth/me", z.object({ data: identityUserSchema }), {
    method: "PATCH",
    body: parsed.data,
    operation: "profile.update",
  });
}
