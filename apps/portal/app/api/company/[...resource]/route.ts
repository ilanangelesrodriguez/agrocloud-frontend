import type { NextRequest } from "next/server";

import { z } from "zod";

import { canManageCompany } from "@/features/company/navigation";
import {
  companyOffers,
  offerKey,
  orderResponse,
  orderStatus,
  chargeResponse,
} from "@/features/plans/schema";
import {
  companyResponseSchema,
  editCompanySchema,
  editUserSchema,
  invitationSchema,
  inviteUserSchema,
  permissionsSchema,
  rolesSchema,
  subscriptionSchema,
  userSchema,
  usersSchema,
} from "@/features/company/schema";
import { authorizedIdentity, positiveInteger } from "@/lib/auth/authorized-identity";
import { parseJson, reply } from "@/lib/auth/route-utils";

type Context = { params: Promise<{ resource: string[] }> };

export async function GET(request: NextRequest, { params }: Context) {
  const resource = (await params).resource.join("/");
  const statusMatch = /^subscription\/orders\/(AGRO-[0-9A-HJKMNP-TV-Z]{26})$/.exec(resource);

  if (statusMatch) {
    return authorizedIdentity(
      request,
      (user) =>
        canManageCompany(user, "suscripciones.ver")
          ? "/subscription/orders/" + statusMatch[1]
          : null,
      orderStatus,
      {
        operation: "company.subscription.order-status",
      },
    );
  }
  if (resource === "subscription/offers") {
    return authorizedIdentity(
      request,
      (user) => (canManageCompany(user, "suscripciones.ver") ? "/subscription/offers" : null),
      companyOffers,
    );
  }
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
    : Object.hasOwn(routes, resource)
      ? routes[resource as keyof typeof routes]
      : undefined;

  if (!route) return reply({ message: "Recurso no encontrado." }, 404);

  const page = request.nextUrl.searchParams.get("page") ?? "1";

  if (resource === "users" && !positiveInteger(page))
    return reply({ message: "Página inválida." }, 400);

  return authorizedIdentity(
    request,
    (user) => {
      if (!canManageCompany(user, route.permission)) return null;

      return company ? "/companies/" + user.id_empresa : "/" + resource;
    },
    route.schema,
    { page: resource === "users" ? Number(page) : undefined, operation: "company.read" },
  );
}

export async function POST(request: NextRequest, { params }: Context) {
  const resource = (await params).resource.join("/");
  const reconcileMatch = /^subscription\/orders\/(AGRO-[0-9A-HJKMNP-TV-Z]{26})\/reconcile$/.exec(
    resource,
  );

  if (reconcileMatch) {
    const json = await parseJson(request);
    if (!json.ok) return json.response;

    return authorizedIdentity(
      request,
      (user) =>
        canManageCompany(user, "suscripciones.gestionar")
          ? "/subscription/orders/" + reconcileMatch[1] + "/reconcile"
          : null,
      orderStatus,
      {
        body: {},
        method: "POST",
        operation: "company.subscription.reconcile",
      },
    );
  }
  const chargeMatch = /^subscription\/orders\/(AGRO-[0-9A-HJKMNP-TV-Z]{26})\/charge$/.exec(
    resource,
  );

  if (chargeMatch) {
    const json = await parseJson(request);

    if (!json.ok) return json.response;
    const token = z
      .object({ token_id: z.string().regex(/^tkn_test_[A-Za-z0-9]+$/) })
      .safeParse(json.body);

    if (!token.success) return reply({ message: "Solo se aceptan tokens Culqi de prueba." }, 422);

    return authorizedIdentity(
      request,
      (user) =>
        canManageCompany(user, "suscripciones.gestionar")
          ? "/subscription/orders/" + chargeMatch[1] + "/charge"
          : null,
      chargeResponse,
      {
        method: "POST",
        body: token.data,
        operation: "company.subscription.sandbox-charge",
      },
    );
  }
  if (resource === "subscription/orders") {
    const json = await parseJson(request);

    if (!json.ok) return json.response;
    const input = z.object({ offer_key: offerKey }).safeParse(json.body);

    if (!input.success) return reply({ message: "Selecciona una oferta válida." }, 422);

    return authorizedIdentity(
      request,
      (user) => (canManageCompany(user, "suscripciones.gestionar") ? "/subscription/orders" : null),
      orderResponse,
      { body: input.data },
    );
  }
  const invitation = /^users\/([1-9]\d*)\/invitation$/.exec(resource);

  if (resource !== "users" && !(invitation && positiveInteger(invitation[1]))) {
    return reply({ message: "Recurso no encontrado." }, 404);
  }
  const json = await parseJson(request);

  if (!json.ok) return json.response;

  if (invitation) {
    return authorizedIdentity(
      request,
      (user) => (canManageCompany(user, "usuarios.editar") ? "/" + resource : null),
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
    (user) => (canManageCompany(user, "usuarios.crear") ? "/users" : null),
    userSchema,
    { body: parsed.data, method: "POST", operation: "company.invite" },
  );
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const [resource, id, ...rest] = (await params).resource;

  if (resource === "profile" && id === undefined) {
    const json = await parseJson(request);

    if (!json.ok) return json.response;
    const parsed = editCompanySchema.safeParse(json.body);

    if (!parsed.success) return reply({ message: "Revisa los datos de la empresa." }, 422);

    return authorizedIdentity(
      request,
      (user) => (canManageCompany(user, "empresa.editar") ? "/companies/" + user.id_empresa : null),
      companyResponseSchema,
      {
        body: parsed.data,
        method: "PATCH",
        operation: "company.profile.update",
      },
    );
  }
  if (resource !== "users" || !id || rest.length || !positiveInteger(id)) {
    return reply({ message: "Usuario no encontrado." }, 404);
  }
  const json = await parseJson(request);

  if (!json.ok) return json.response;
  const parsed = editUserSchema.safeParse(json.body);

  if (!parsed.success) return reply({ message: "Selecciona un cambio válido." }, 422);

  return authorizedIdentity(
    request,
    (user) =>
      canManageCompany(user, "usuarios.editar") &&
      (parsed.data.estado === undefined || canManageCompany(user, "usuarios.estado"))
        ? "/users/" + id
        : null,
    userSchema,
    { body: parsed.data, method: "PATCH", operation: "company.user.update" },
  );
}
