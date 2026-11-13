import type { NextRequest } from "next/server";

import { z } from "zod";

import {
  rolesSchema,
  usersSchema,
  userSchema,
  inviteUserSchema,
  invitationSchema,
  editUserSchema,
} from "@/features/company/schema";
import { adminIdentity, positiveInteger } from "@/lib/auth/admin-route";
import { parseJson, reply } from "@/lib/auth/route-utils";

type Context = { params: Promise<{ resource: string[] }> };
const offers = z.object({
  data: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      amount_cents: z.number(),
      currency: z.literal("PEN"),
      duration_days: z.number(),
    }),
  ),
});

export async function GET(request: NextRequest, { params }: Context) {
  const [resource, id, ...rest] = (await params).resource;

  if (rest.length) return reply({ message: "Recurso no encontrado." }, 404);
  if (resource === "users") {
    const page = request.nextUrl.searchParams.get("page") ?? "1";

    if (!id && positiveInteger(page))
      return adminIdentity(request, "/users", usersSchema, { page: Number(page) });
    if (id && positiveInteger(id)) return adminIdentity(request, "/users/" + id, userSchema);
  }
  if (!id && resource === "roles") return adminIdentity(request, "/roles", rolesSchema);
  if (!id && resource === "offers") return adminIdentity(request, "/public/offers", offers);

  return reply({ message: "Recurso no encontrado." }, 404);
}

async function save(request: NextRequest, { params }: Context, method: "POST" | "PATCH") {
  const [resource, id, action, ...rest] = (await params).resource;

  if (resource !== "users" || rest.length || (id && !positiveInteger(id))) {
    return reply({ message: "Recurso no encontrado." }, 404);
  }
  const json = await parseJson(request);

  if (!json.ok) return json.response;
  if (method === "POST" && id && action === "invitation") {
    return adminIdentity(request, "/users/" + id + "/invitation", invitationSchema, { body: {} });
  }
  if (method === "PATCH" && id && !action) {
    const input = editUserSchema.safeParse(json.body);

    if (!input.success) return reply({ message: "Revisa los cambios del usuario." }, 422);

    return adminIdentity(request, "/users/" + id, userSchema, { body: input.data, method });
  }
  if (method === "POST" && !id && !action) {
    const input = inviteUserSchema
      .extend({ id_empresa: z.number().int().positive() })
      .safeParse(json.body);

    if (!input.success) return reply({ message: "Completa los datos, la empresa y el rol." }, 422);

    return adminIdentity(request, "/users", userSchema, { body: input.data });
  }

  return reply({ message: "Recurso no encontrado." }, 404);
}

export function POST(request: NextRequest, context: Context) {
  return save(request, context, "POST");
}

export function PATCH(request: NextRequest, context: Context) {
  return save(request, context, "PATCH");
}
