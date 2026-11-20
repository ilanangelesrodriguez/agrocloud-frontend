import { setupSchema } from "@/features/dashboard/schema";
import { producerList } from "./schema";
import {
  companyAiProducers,
  companyOverview,
  companyClasses,
  companyDaily,
  companyModels,
  companyValidation,
} from "@/features/ai/schema";
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
  responsiblePage,
  incidentEvidences,
  incidentHistory,
  dashboardResponse,
  lotList,
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
          : "incidencias.ver";
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
    permission = "incidencias.ver";
    schema = incidentsPage;
  } else if (segments.length === 2 && resource === "reports" && id === "summary") {
    path = "/reports/summary";
    permission = "reportes.operativos";
    schema = reportSummary;
  } else if (segments.length === 1 && resource === "incident-responsibles") {
    path = "/incident-responsibles";
    permission = "incidencias.crear";
    schema = responsiblePage;
  } else if (
    segments.length === 3 &&
    resource === "lots" &&
    positiveInteger(id) &&
    action === "incident-evidences"
  ) {
    path = `/lots/${id}/incident-evidences`;
    permission = "incidencias.ver";
    schema = incidentEvidences;
  } else if (
    segments.length === 3 &&
    resource === "incidents" &&
    positiveInteger(id) &&
    action === "history"
  ) {
    path = `/incidents/${id}/history`;
    permission = "incidencias.ver";
    schema = incidentHistory;
  } else if (segments.length === 2 && resource === "production" && id === "lots") {
    path = "/production/lots";
    permission = "produccion.ver";
    schema = lotList;
  } else if (segments.length === 1 && resource === "dashboard") {
    path = "/dashboard";
    permission = "";
    schema = dashboardResponse;
  } else if (segments.length === 1 && resource === "setup") {
    path = "/setup";
    permission = "empresa.editar";
    schema = setupSchema;
  } else if (segments.length === 2 && resource === "reports" && id === "producers") {
    path = "/reports/producers";
    permission = "reportes.operativos";
    schema = producerList;
  } else if (
    segments.length === 3 &&
    resource === "reports" &&
    id === "ai" &&
    action === "producers"
  ) {
    path = "/reports/ai/producers";
    permission = "ia.reportes.ver";
    schema = companyAiProducers;
  } else if (
    segments.length === 3 &&
    resource === "reports" &&
    id === "ai" &&
    ["overview", "classes", "daily", "models", "validation"].includes(action)
  ) {
    path = `/reports/ai/${action}`;
    permission = "ia.reportes.ver";
    schema = (
      {
        overview: companyOverview,
        classes: companyClasses,
        daily: companyDaily,
        models: companyModels,
        validation: companyValidation,
      } as Record<string, z.ZodType<object>>
    )[action];
  } else return null;
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  const status = request.nextUrl.searchParams.get("estado") ?? undefined;
  if (!positiveInteger(page) || (status && !["EN_CAPTURA", "VALIDADA"].includes(status)))
    return reply({ message: "Filtro inválido." }, 400);
  const decision = request.nextUrl.searchParams.get("decision_status") ?? undefined;
  if (decision && !["PENDING", "OBSERVED", "COMPLETED"].includes(decision))
    return reply({ message: "Filtro de calidad inválido." }, 422);
  const reportFilter =
    resource === "reports"
      ? Object.fromEntries(
          ["from", "to", "producto", "variedad", "producer_id", "model_id"].map((key) => [
            key,
            request.nextUrl.searchParams.get(key) ?? undefined,
          ]),
        )
      : undefined;
  return authorizedIdentity(
    request,
    (user) => (canManageCompany(user, permission) ? path : null),
    schema,
    {
      service: "agricultural",
      page: Number(page),
      agriculturalStatus: status,
      decisionStatus: decision as "PENDING" | "OBSERVED" | "COMPLETED" | undefined,
      reportFilter,
    },
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
      canManageCompany(
        user,
        cancel ? "lotes.eliminar" : create ? "incidencias.crear" : "incidencias.ver",
      ) &&
      (!create ||
        ["ADMIN", "RECEPCION", "INSPECTOR", "SUPERVISOR"].includes(user.rol?.codigo ?? ""))
        ? "/" + segments.join("/")
        : null,
    cancel ? cancelResponse : incidentResponse,
    { service: "agricultural", method, body: input.data },
  );
}
