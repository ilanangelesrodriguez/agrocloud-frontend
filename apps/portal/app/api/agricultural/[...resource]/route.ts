import { z } from "zod";
import type { NextRequest } from "next/server";

import { procedurePage, samplingInput, samplingResponse } from "@/features/agricultural/sampling";
import {
  samplingDetail,
  samplingFruits,
  inspectionDetail,
  inspectionCreated,
  evidenceResponse,
  evidenceTypes,
  evidenceMaxBytes,
  analysisQueued,
} from "@/features/agricultural/inspection";
import {
  catalog,
  catalogType,
  lotDetail,
  lotInput,
  lotList,
  operationKey,
  producerDetail,
  producerInput,
  producerList,
  receptionInput,
  receptionResponse,
  traceabilityResponse,
} from "@/features/agricultural/schema";
import { canManageCompany } from "@/features/company/navigation";
import {
  catalogInput,
  catalogCreated,
  catalogToggle,
  catalogUpdated,
  procedureInput,
  procedureCreated,
  procedureResponse,
  procedureToggle,
} from "@/features/company/agricultural/schema";
import { authorizedIdentity, positiveInteger } from "@/lib/auth/authorized-identity";
import { isAllowedOrigin, parseJson, reply } from "@/lib/auth/route-utils";
import { saveInspectionAction } from "@/features/inspections/review-route";

import { readOperation, saveOperation } from "@/features/agricultural/operations-route";

type Context = { params: Promise<{ resource: string[] }> };

export async function GET(request: NextRequest, { params }: Context) {
  const evidencePath = (await params).resource;
  const operation = await readOperation(request, evidencePath);
  if (operation) return operation;

  if (
    evidencePath.length === 3 &&
    evidencePath[0] === "evidences" &&
    evidencePath[2] === "image" &&
    positiveInteger(evidencePath[1])
  ) {
    return authorizedIdentity(
      request,
      (user) =>
        canManageCompany(user, "inspecciones.ver")
          ? "/evidences/" + evidencePath[1] + "/image"
          : null,
      "image",
      { service: "agricultural" },
    );
  }
  const [resource, id, ...rest] = (await params).resource;
  if (resource === "catalogs" && id === "admin" && !rest.length) {
    const type = catalogType.safeParse(request.nextUrl.searchParams.get("tipo"));
    if (!type.success) return reply({ message: "Catálogo inválido." }, 422);
    return authorizedIdentity(
      request,
      (user) =>
        user.rol?.codigo === "ADMIN" && canManageCompany(user, "empresa.editar")
          ? "/catalogs/admin"
          : null,
      catalog,
      { service: "agricultural", catalogType: type.data },
    );
  }

  if (
    resource === "samplings" &&
    id &&
    positiveInteger(id) &&
    rest.length === 1 &&
    rest[0] === "fruits"
  ) {
    const page = request.nextUrl.searchParams.get("page") ?? "1";

    if (!positiveInteger(page)) return reply({ message: "Página inválida." }, 400);

    return authorizedIdentity(
      request,
      (user) => (canManageCompany(user, "muestreos.ver") ? "/samplings/" + id + "/fruits" : null),
      samplingFruits,
      {
        service: "agricultural",
        page: Number(page),
        operation: "agricultural.sample.fruits",
      },
    );
  }
  if (resource === "samplings" && id && positiveInteger(id) && !rest.length) {
    return authorizedIdentity(
      request,
      (user) => (canManageCompany(user, "muestreos.ver") ? "/samplings/" + id : null),
      samplingDetail,
      {
        service: "agricultural",
        operation: "agricultural.sample.detail",
      },
    );
  }
  if (resource === "inspections" && id && positiveInteger(id) && !rest.length) {
    return authorizedIdentity(
      request,
      (user) => (canManageCompany(user, "inspecciones.ver") ? "/inspections/" + id : null),
      inspectionDetail,
      {
        service: "agricultural",
        operation: "agricultural.inspection.detail",
      },
    );
  }
  if (
    resource === "lots" &&
    id &&
    positiveInteger(id) &&
    rest.length === 1 &&
    rest[0] === "traceability"
  ) {
    const page = request.nextUrl.searchParams.get("page") ?? "1";

    if (!positiveInteger(page)) return reply({ message: "Página inválida." }, 400);

    return authorizedIdentity(
      request,
      (user) =>
        canManageCompany(user, "trazabilidad.ver") ? "/lots/" + id + "/traceability" : null,
      traceabilityResponse,
      {
        service: "agricultural",
        page: Number(page),
        operation: "agricultural.traceability",
      },
    );
  }
  if (rest.length || (id !== undefined && !positiveInteger(id))) {
    return reply({ message: "Recurso inválido." }, 404);
  }
  const page = request.nextUrl.searchParams.get("page") ?? "1";

  if (!positiveInteger(page)) return reply({ message: "Página inválida." }, 400);
  if (resource === "sampling-procedures" && !id) {
    const producto = request.nextUrl.searchParams.get("producto")?.trim() || undefined;
    const activo = request.nextUrl.searchParams.get("activo");
    const productId = request.nextUrl.searchParams.get("producto_id");
    if (productId !== null && !positiveInteger(productId))
      return reply({ message: "Producto inválido." }, 422);
    if (
      (producto && producto.length > 150) ||
      (activo !== null && !["true", "false"].includes(activo))
    )
      return reply({ message: "Filtro de procedimiento inválido." }, 422);
    return authorizedIdentity(
      request,
      (user) =>
        canManageCompany(user) &&
        ["empresa.editar", "muestreos.crear", "muestreos.ver"].some((permission) =>
          user.permissions.includes(permission),
        )
          ? "/sampling-procedures"
          : null,
      procedurePage,
      {
        service: "agricultural",
        page: Number(page),
        procedureFilter: {
          producto,
          producto_id: productId ? Number(productId) : undefined,
          activo: activo === null ? undefined : activo === "true",
        },
      },
    );
  }

  if (resource === "catalogs" && !id) {
    const type = catalogType.safeParse(request.nextUrl.searchParams.get("tipo"));

    if (!type.success) return reply({ message: "Catálogo inválido." }, 422);

    return authorizedIdentity(
      request,
      (user) =>
        canManageCompany(user) &&
        [
          "empresa.editar",
          "muestreos.crear",
          "lotes.ver",
          "lotes.crear",
          "inspecciones.validar",
          "calidad.clasificar",
        ].some((permission) => user.permissions.includes(permission))
          ? "/catalogs"
          : null,
      catalog,
      {
        service: "agricultural",
        catalogType: type.data,
        operation: "agricultural.catalogs",
      },
    );
  }
  if (resource !== "producers" && resource !== "lots") {
    return reply({ message: "Recurso no encontrado." }, 404);
  }

  const permission = resource === "producers" ? "productores.ver" : "lotes.ver";
  const schema =
    resource === "producers" ? (id ? producerDetail : producerList) : id ? lotDetail : lotList;

  return authorizedIdentity(
    request,
    (user) => (canManageCompany(user, permission) ? "/" + resource + (id ? "/" + id : "") : null),
    schema,
    {
      service: "agricultural",
      page: id ? undefined : Number(page),
      agriculturalStatus:
        resource === "lots" && request.nextUrl.searchParams.get("estado") === "CLASIFICADO"
          ? "CLASIFICADO"
          : undefined,
      operation: "agricultural.read",
    },
  );
}

async function save(request: NextRequest, { params }: Context, method: "POST" | "PUT") {
  const [resource, id, ...rest] = (await params).resource;
  const isLot = resource === "lots";

  if (
    rest.length ||
    (resource !== "producers" && !isLot) ||
    (method === "POST" ? id !== undefined : isLot || !id || !positiveInteger(id))
  ) {
    return reply({ message: "Recurso no encontrado." }, 404);
  }
  const json = await parseJson(request);

  if (!json.ok) return json.response;
  const input = (isLot ? lotInput : producerInput).safeParse(json.body);

  if (!input.success)
    return reply({ message: input.error.issues[0]?.message ?? "Revisa los datos." }, 422);
  const key = isLot ? operationKey.safeParse(request.headers.get("Idempotency-Key")) : undefined;

  if (key && !key.success)
    return reply({ message: "La clave de operación debe ser un UUID." }, 422);
  const permission = isLot
    ? "lotes.crear"
    : method === "PUT"
      ? "productores.editar"
      : "productores.crear";

  return authorizedIdentity(
    request,
    (user) => (canManageCompany(user, permission) ? "/" + resource + (id ? "/" + id : "") : null),
    isLot ? lotDetail : producerDetail,
    {
      service: "agricultural",
      method,
      body: input.data,
      idempotencyKey: key?.data,
      operation: isLot ? "agricultural.lots.create" : "agricultural.producers.save",
    },
  );
}

export async function POST(request: NextRequest, context: Context) {
  const operation = await saveOperation(request, (await context.params).resource, "POST");
  if (operation) return operation;
  const reviewed = await saveInspectionAction(request, (await context.params).resource, "POST");
  if (reviewed) return reviewed;
  const [resource, id, action, ...rest] = (await context.params).resource;

  if (["catalogs", "sampling-procedures"].includes(resource) && !id) {
    return saveConfiguration(request, context, "POST");
  }

  if (
    resource === "inspections" &&
    id &&
    positiveInteger(id) &&
    action === "evidences" &&
    !rest.length
  ) {
    if (!isAllowedOrigin(request)) {
      return reply({ message: "Origen no permitido." }, 403);
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) {
      return reply({ message: "Envía una fotografía como formulario." }, 415);
    }
    const maxBody = evidenceMaxBytes + 64 * 1024;

    if (Number(request.headers.get("content-length")) > maxBody)
      return reply({ message: "La fotografía supera los 3 MB." }, 413);
    const reader = request.body?.getReader();

    if (!reader) return reply({ message: "Falta la fotografía." }, 400);
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let size = 0;

    try {
      for (;;) {
        const chunk = await reader.read();

        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > maxBody) {
          await reader.cancel();

          return reply({ message: "La fotografía supera los 3 MB." }, 413);
        }
        chunks.push(new Uint8Array(chunk.value));
      }
    } catch {
      return reply({ message: "No se pudo leer la fotografía." }, 400);
    }
    const form = await new Response(new Blob(chunks), {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    })
      .formData()
      .catch(() => null);
    const fruit = form?.get("id_fruto");
    const photo = form?.get("foto");

    if (
      typeof fruit !== "string" ||
      !positiveInteger(fruit) ||
      !(photo instanceof File) ||
      !evidenceTypes.includes(photo.type) ||
      photo.size === 0 ||
      photo.size > evidenceMaxBytes
    ) {
      return reply(
        { message: "Selecciona un fruto y una imagen JPG, PNG o WebP de hasta 3 MB." },
        422,
      );
    }
    const body = new FormData();

    body.set("id_fruto", fruit);
    body.set("foto", photo);

    return authorizedIdentity(
      request,
      (user) =>
        user.rol?.codigo === "INSPECTOR" && canManageCompany(user, "inspecciones.capturar")
          ? "/inspections/" + id + "/evidences"
          : null,
      evidenceResponse,
      { service: "agricultural", body },
    );
  }
  if (
    resource === "evidences" &&
    id &&
    positiveInteger(id) &&
    action === "analyze" &&
    !rest.length
  ) {
    const json = await parseJson(request);

    if (!json.ok) return json.response;

    return authorizedIdentity(
      request,
      (user) =>
        user.rol?.codigo === "INSPECTOR" && canManageCompany(user, "inspecciones.analizar")
          ? "/evidences/" + id + "/analyze"
          : null,
      analysisQueued,
      { service: "agricultural", body: {} },
    );
  }
  if (
    resource === "samplings" &&
    id &&
    positiveInteger(id) &&
    action === "inspections" &&
    !rest.length
  ) {
    return authorizedIdentity(
      request,
      (user) =>
        user.rol?.codigo === "INSPECTOR" && canManageCompany(user, "inspecciones.crear")
          ? "/samplings/" + id + "/inspections"
          : null,
      inspectionCreated,
      {
        service: "agricultural",
        method: "POST",
        body: {},
        operation: "agricultural.inspection.start",
      },
    );
  }
  if (resource === "lots" && id && positiveInteger(id) && action === "samplings" && !rest.length) {
    const json = await parseJson(request);

    if (!json.ok) return json.response;
    const input = samplingInput.safeParse(json.body);

    if (!input.success) return reply({ message: "Revisa los datos del muestreo." }, 422);

    return authorizedIdentity(
      request,
      (user) =>
        user.rol?.codigo === "INSPECTOR" && canManageCompany(user, "muestreos.crear")
          ? "/lots/" + id + "/samplings"
          : null,
      samplingResponse,
      { service: "agricultural", body: input.data },
    );
  }
  if (resource === "lots" && id && positiveInteger(id) && action === "reception" && !rest.length) {
    const json = await parseJson(request);

    if (!json.ok) return json.response;
    const parsed = receptionInput.safeParse(json.body);

    if (!parsed.success) return reply({ message: "Revisa los datos de recepción." }, 422);

    return authorizedIdentity(
      request,
      (user) =>
        user.rol?.codigo === "RECEPCION" && canManageCompany(user, "recepciones.crear")
          ? "/lots/" + id + "/reception"
          : null,
      receptionResponse,
      {
        service: "agricultural",
        body: parsed.data,
        operation: "agricultural.reception",
      },
    );
  }

  return save(request, context, "POST");
}

export async function PUT(request: NextRequest, context: Context) {
  const [resource, id, ...rest] = (await context.params).resource;
  if (resource === "catalogs" && id && positiveInteger(id) && !rest.length) {
    const json = await parseJson(request);
    if (!json.ok) return json.response;
    const input = z.object({ nombre: z.string().trim().min(1).max(150) }).safeParse(json.body);
    if (!input.success)
      return reply({ message: "Ingresa un nombre de hasta 150 caracteres." }, 422);
    return authorizedIdentity(
      request,
      (user) =>
        user.rol?.codigo === "ADMIN" && canManageCompany(user, "empresa.editar")
          ? `/catalogs/${id}`
          : null,
      catalogUpdated,
      { service: "agricultural", method: "PUT", body: input.data },
    );
  }
  return save(request, context, "PUT");
}

async function saveConfiguration(
  request: NextRequest,
  { params }: Context,
  method: "POST" | "PATCH",
) {
  const [resource, id, ...rest] = (await params).resource;
  if (
    !["catalogs", "sampling-procedures"].includes(resource) ||
    rest.length ||
    (method === "POST" ? id !== undefined : !id || !positiveInteger(id))
  ) {
    return reply({ message: "Recurso no encontrado." }, 404);
  }
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const isCatalog = resource === "catalogs";
  const schema =
    method === "PATCH"
      ? isCatalog
        ? catalogToggle
        : procedureToggle
      : isCatalog
        ? catalogInput
        : procedureInput;
  const input = schema.safeParse(json.body);
  if (!input.success)
    return reply({ message: input.error.issues[0]?.message ?? "Revisa los datos." }, 422);
  return authorizedIdentity(
    request,
    (user) =>
      user.rol?.codigo === "ADMIN" && canManageCompany(user, "empresa.editar")
        ? "/" + resource + (id ? "/" + id : "")
        : null,
    isCatalog
      ? method === "POST"
        ? catalogCreated
        : catalogUpdated
      : method === "POST"
        ? procedureCreated
        : procedureResponse,
    {
      service: "agricultural",
      method,
      body: input.data,
      operation: "agricultural.configuration.save",
    },
  );
}

export async function PATCH(request: NextRequest, context: Context) {
  const operation = await saveOperation(request, (await context.params).resource, "PATCH");
  if (operation) return operation;
  const reviewed = await saveInspectionAction(request, (await context.params).resource, "PATCH");
  if (reviewed) return reviewed;
  return saveConfiguration(request, context, "PATCH");
}
