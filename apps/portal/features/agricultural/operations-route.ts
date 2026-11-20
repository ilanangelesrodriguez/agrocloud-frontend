import type { z } from "zod";
import type { NextRequest } from "next/server";
import { authorizedIdentity, positiveInteger } from "@/lib/auth/authorized-identity";
import { parseJson, reply } from "@/lib/auth/route-utils";
import { canManageCompany } from "@/features/company/navigation";
import {
  samplingsPage,
  inspectionsPage,
  incidentsPage,
  incidentInput,
  incidentUpdate,
  incidentResponse,
  cancelInput,
  cancelResponse,
  reportSummary,
} from "./operations-schema";

export async function readOperation(request: NextRequest, segments: string[]) {
  const [resource, id, action] = segments;
  let path: string;
  let permission: string;
  let schema: z.ZodType<object>;
  if (segments.length === 1 && ["samplings", "inspections", "incidents"].includes(resource)) {
    path = "/" + resource;
    permission =
      resource === "samplings"
        ? "muestreos.ver"
        : resource === "inspections"
          ? "inspecciones.ver"
          : "lotes.ver";
    schema =
      resource === "samplings"
        ? samplingsPage
        : resource === "inspections"
          ? inspectionsPage
          : incidentsPage;
  } else if (
    segments.length === 3 &&
    resource === "lots" &&
    positiveInteger(id) &&
    action === "incidents"
  ) {
    path = `/lots/${id}/incidents`;
    permission = "lotes.ver";
    schema = incidentsPage;
  } else if (segments.length === 2 && resource === "reports" && id === "summary") {
    path = "/reports/summary";
    permission = "reportes.operativos";
    schema = reportSummary;
  } else return null;
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  const status = request.nextUrl.searchParams.get("estado") ?? undefined;
  if (!positiveInteger(page) || (status && !["EN_CAPTURA", "VALIDADA"].includes(status)))
    return reply({ message: "Filtro inválido." }, 400);
  return authorizedIdentity(
    request,
    (user) => (canManageCompany(user, permission) ? path : null),
    schema,
    { service: "agricultural", page: Number(page), agriculturalStatus: status },
  );
}
export async function saveOperation(
  request: NextRequest,
  segments: string[],
  method: "POST" | "PATCH",
) {
  const [resource, id, action] = segments;
  const cancel =
    method === "POST" && segments.length === 3 && resource === "lots" && action === "cancel";
  const create =
    method === "POST" && segments.length === 3 && resource === "lots" && action === "incidents";
  const update = method === "PATCH" && segments.length === 2 && resource === "incidents";
  if (!(cancel || create || update) || !positiveInteger(id)) return null;
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const input = (cancel ? cancelInput : create ? incidentInput : incidentUpdate).safeParse(
    json.body,
  );
  if (!input.success)
    return reply({ message: input.error.issues[0]?.message ?? "Revisa los datos." }, 422);
  return authorizedIdentity(
    request,
    (user) =>
      canManageCompany(user, cancel ? "lotes.eliminar" : "lotes.ver") &&
      (!create ||
        ["ADMIN", "RECEPCION", "INSPECTOR", "SUPERVISOR"].includes(user.rol?.codigo ?? ""))
        ? "/" + segments.join("/")
        : null,
    cancel ? cancelResponse : incidentResponse,
    { service: "agricultural", method, body: input.data },
  );
}
