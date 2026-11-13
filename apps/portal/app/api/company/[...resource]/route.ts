import type { NextRequest } from "next/server";

import { canManageCompany } from "@/features/company/navigation";
import {
  companyResponseSchema, editUserSchema, invitationSchema, inviteUserSchema,
  permissionsSchema, rolesSchema, subscriptionSchema, userSchema, usersSchema,
} from "@/features/company/schema";
import { authorizedIdentity, positiveInteger } from "@/lib/auth/authorized-identity";
import { parseJson, reply } from "@/lib/auth/route-utils";

type Context = { params: Promise<{ resource: string[] }> };

export async function GET(request: NextRequest, { params }: Context) {
  const resource = (await params).resource.join("/");
  const company = resource === "profile";
  const userId = resource.startsWith("users/") ? resource.slice(6) : "";
  const routes = {
    profile: { schema: companyResponseSchema, permission: "empresa.ver" },
    users: { schema: usersSchema, permission: "usuarios.ver" },
    roles: { schema: rolesSchema, permission: "usuarios.ver" },
    permissions: { schema: permissionsSchema, permission: undefined },
    subscription: { schema: subscriptionSchema, permission: "suscripciones.ver" },
  };
  const route = positiveInteger(userId)
    ? { schema: userSchema, permission: "usuarios.ver" }
    : Object.hasOwn(routes, resource) ? routes[resource as keyof typeof routes] : undefined;
  if (!route) return reply({ message: "Recurso no encontrado." }, 404);

  const page = request.nextUrl.searchParams.get("page") ?? "1";
  if (resource === "users" && !positiveInteger(page)) return reply({ message: "Página inválida." }, 400);

  return authorizedIdentity(request, (user) => {
    if (!canManageCompany(user, route.permission)) return null;

    return company ? "/companies/" + user.id_empresa : "/" + resource;
  }, route.schema, { page: resource === "users" ? Number(page) : undefined, operation: "company.read" });
}

export async function POST(request: NextRequest, { params }: Context) {
  const resource = (await params).resource.join("/");
  const invitation = /^users\/([1-9]\d*)\/invitation$/.exec(resource);
  if (resource !== "users" && !(invitation && positiveInteger(invitation[1]))) {
    return reply({ message: "Recurso no encontrado." }, 404);
  }
  const json = await parseJson(request);
  if (!json.ok) return json.response;

  if (invitation) {
    return authorizedIdentity(
      request,
      (user) => canManageCompany(user, "usuarios.editar") ? "/" + resource : null,
      invitationSchema,
      { body: {}, method: "POST", operation: "company.invitation.resend" },
    );
  }

  const parsed = inviteUserSchema.safeParse(json.body);
  if (!parsed.success) {
    return reply({ message: parsed.error.issues[0]?.message ?? "Revisa los datos." }, 422);
  }

  return authorizedIdentity(
    request,
    (user) => canManageCompany(user, "usuarios.crear") ? "/users" : null,
    userSchema,
    { body: parsed.data, method: "POST", operation: "company.invite" },
  );
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const [resource, id, ...rest] = (await params).resource;
  if (resource !== "users" || !id || rest.length || !positiveInteger(id)) {
    return reply({ message: "Usuario no encontrado." }, 404);
  }
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const parsed = editUserSchema.safeParse(json.body);
  if (!parsed.success) return reply({ message: "Selecciona un cambio válido." }, 422);

  return authorizedIdentity(
    request,
    (user) => canManageCompany(user, "usuarios.editar") &&
      (parsed.data.estado === undefined || canManageCompany(user, "usuarios.estado")) ? "/users/" + id : null,
    userSchema,
    { body: parsed.data, method: "PATCH", operation: "company.user.update" },
  );
}
