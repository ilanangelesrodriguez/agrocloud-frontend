import type { NextRequest } from "next/server";
import { z } from "zod";
import { authorizedIdentity } from "@/lib/auth/authorized-identity";
import { clearSession } from "@/lib/auth/cookie-session";
import { password } from "@/lib/auth/schemas";
import { parseJson, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";
const input = z
  .object({
    current_password: z.string().min(1).max(255),
    password,
    password_confirmation: z.string().min(1),
  })
  .refine((x) => x.password === x.password_confirmation, { path: ["password_confirmation"] });

export async function POST(request: NextRequest) {
  const body = await parseJson(request);
  if (!body.ok) return body.response;
  const parsed = input.safeParse(body.body);
  if (!parsed.success)
    return reply({ message: "Comprueba la contraseña actual y la nueva contraseña." }, 422);
  const response = await authorizedIdentity(
    request,
    () => "/auth/change-password",
    z.object({ message: z.string() }),
    {
      method: "POST",
      body: parsed.data,
      operation: "profile.change-password",
    },
  );
  if (response.ok) clearSession(response);
  return response;
}
