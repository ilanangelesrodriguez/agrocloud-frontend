import type { NextRequest } from "next/server";
import { procedurePage, samplingInput, samplingResponse } from "@/features/agricultural/sampling";

import {
  catalog, catalogType, lotDetail, lotInput, lotList,
  operationKey, producerDetail, producerInput, producerList,
  receptionInput, receptionResponse, traceabilityResponse,
} from "@/features/agricultural/schema";
import { canManageCompany } from "@/features/company/navigation";
import { authorizedIdentity, positiveInteger } from "@/lib/auth/authorized-identity";
import { parseJson, reply } from "@/lib/auth/route-utils";

type Context = { params: Promise<{ resource: string[] }> };

export async function GET(request: NextRequest, { params }: Context) {
  const [resource, id, ...rest] = (await params).resource;
  if (resource === "lots" && id && positiveInteger(id) && rest.length === 1 && rest[0] === "traceability") {
    const page = request.nextUrl.searchParams.get("page") ?? "1";
    if (!positiveInteger(page)) return reply({ message: "Página inválida." }, 400);
    return authorizedIdentity(request, (user) => canManageCompany(user, "trazabilidad.ver")
      ? "/lots/" + id + "/traceability" : null, traceabilityResponse, {
      service: "agricultural", page: Number(page), operation: "agricultural.traceability",
    });
  }
  if (rest.length || (id !== undefined && !positiveInteger(id))) {
    return reply({ message: "Recurso inválido." }, 404);
  }
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  if (!positiveInteger(page)) return reply({ message: "Página inválida." }, 400);
  if (resource === "sampling-procedures" && !id) {
    return authorizedIdentity(request, (user) => canManageCompany(user, "muestreos.crear")
      ? "/sampling-procedures" : null, procedurePage, { service: "agricultural", page: Number(page) });
  }

  if (resource === "catalogs" && !id) {
    const type = catalogType.safeParse(request.nextUrl.searchParams.get("tipo"));
    if (!type.success) return reply({ message: "Catálogo inválido." }, 422);

    return authorizedIdentity(request, (user) => canManageCompany(user) &&
      ["lotes.ver", "lotes.crear"].some((permission) => user.permissions.includes(permission))
      ? "/catalogs" : null, catalog, {
      service: "agricultural", catalogType: type.data, operation: "agricultural.catalogs",
    });
  }
  if (resource !== "producers" && resource !== "lots") {
    return reply({ message: "Recurso no encontrado." }, 404);
  }

  const permission = resource === "producers" ? "productores.ver" : "lotes.ver";
  const schema = resource === "producers"
    ? id ? producerDetail : producerList
    : id ? lotDetail : lotList;

  return authorizedIdentity(request, (user) => canManageCompany(user, permission)
    ? "/" + resource + (id ? "/" + id : "") : null, schema, {
    service: "agricultural", page: id ? undefined : Number(page), operation: "agricultural.read",
  });
}

async function save(request: NextRequest, { params }: Context, method: "POST" | "PUT") {
  const [resource, id, ...rest] = (await params).resource;
  const isLot = resource === "lots";
  if (rest.length || (resource !== "producers" && !isLot) ||
    (method === "POST" ? id !== undefined : isLot || !id || !positiveInteger(id))) {
    return reply({ message: "Recurso no encontrado." }, 404);
  }
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const input = (isLot ? lotInput : producerInput).safeParse(json.body);
  if (!input.success) return reply({ message: input.error.issues[0]?.message ?? "Revisa los datos." }, 422);
  const key = isLot ? operationKey.safeParse(request.headers.get("Idempotency-Key")) : undefined;
  if (key && !key.success) return reply({ message: "La clave de operación debe ser un UUID." }, 422);
  const permission = isLot ? "lotes.crear" : method === "PUT" ? "productores.editar" : "productores.crear";

  return authorizedIdentity(request, (user) => canManageCompany(user, permission)
    ? "/" + resource + (id ? "/" + id : "") : null, isLot ? lotDetail : producerDetail, {
    service: "agricultural", method, body: input.data, idempotencyKey: key?.data,
    operation: isLot ? "agricultural.lots.create" : "agricultural.producers.save",
  });
}

export async function POST(request: NextRequest, context: Context) {
  const [resource, id, action, ...rest] = (await context.params).resource;
  if (resource === "lots" && id && positiveInteger(id) && action === "samplings" && !rest.length) {
    const json = await parseJson(request);
    if (!json.ok) return json.response;
    const input = samplingInput.safeParse(json.body);
    if (!input.success) return reply({ message: "Revisa los datos del muestreo." }, 422);
    return authorizedIdentity(request, (user) => user.rol?.codigo === "INSPECTOR" && canManageCompany(user, "muestreos.crear")
      ? "/lots/" + id + "/samplings" : null, samplingResponse, { service: "agricultural", body: input.data });
  }
  if (resource === "lots" && id && positiveInteger(id) && action === "reception" && !rest.length) {
    const json = await parseJson(request);
    if (!json.ok) return json.response;
    const parsed = receptionInput.safeParse(json.body);
    if (!parsed.success) return reply({ message: "Revisa los datos de recepción." }, 422);

    return authorizedIdentity(request, (user) =>
      user.rol?.codigo === "RECEPCION" && canManageCompany(user, "recepciones.crear")
        ? "/lots/" + id + "/reception" : null, receptionResponse, {
      service: "agricultural", body: parsed.data, operation: "agricultural.reception",
    });
  }
  return save(request, context, "POST");
}

export function PUT(request: NextRequest, context: Context) {
  return save(request, context, "PUT");
}
