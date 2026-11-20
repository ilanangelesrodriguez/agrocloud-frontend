import type { NextRequest } from "next/server";
import { authorizedIdentity, positiveInteger } from "@/lib/auth/authorized-identity";
import { parseJson, reply } from "@/lib/auth/route-utils";
import { canManageCompany } from "@/features/company/navigation";
import { evidenceResponse, inspectionCreated } from "@/features/agricultural/inspection";
import {
  detectionInput,
  detectionResponse,
  findingInput,
  findingResponse,
  reviewInput,
  reasonInput,
  inspectionValidationInput,
  decisionInput,
  decisionResponse,
} from "./review-schema";

export async function saveInspectionAction(
  request: NextRequest,
  parts: string[],
  method: "POST" | "PATCH",
) {
  const [resource, id, action, index] = parts;
  if (!id || !positiveInteger(id)) return null;
  const detection =
    method === "PATCH" &&
    resource === "evidences" &&
    action === "detections" &&
    parts.length === 4 &&
    /^(0|[1-9]\d{0,3})$/.test(index ?? "");
  const cancel =
    method === "POST" &&
    resource === "evidences" &&
    action === "analysis" &&
    index === "cancel" &&
    parts.length === 4;
  const evidenceAction =
    method === "POST" &&
    resource === "evidences" &&
    ["review", "discard"].includes(action) &&
    parts.length === 3;
  const inspectionAction =
    method === "POST" &&
    resource === "inspections" &&
    ["findings", "validate", "decisions"].includes(action) &&
    parts.length === 3;
  if (!detection && !cancel && !evidenceAction && !inspectionAction) return null;
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const schema = detection
    ? detectionInput
    : cancel || action === "discard"
      ? reasonInput
      : action === "review"
        ? reviewInput
        : action === "findings"
          ? findingInput
          : action === "validate"
            ? inspectionValidationInput
            : decisionInput;
  const input = schema.safeParse(json.body);
  if (!input.success)
    return reply({ message: input.error.issues[0]?.message ?? "Revisa los datos." }, 422);
  const permission = cancel
    ? "inspecciones.analizar"
    : action === "decisions"
      ? "calidad.clasificar"
      : "inspecciones.validar";
  return authorizedIdentity(
    request,
    (user) =>
      user.rol?.codigo === (action === "decisions" ? "SUPERVISOR" : "INSPECTOR") &&
      canManageCompany(user, permission)
        ? "/" + parts.join("/")
        : null,
    detection
      ? detectionResponse
      : action === "findings"
        ? findingResponse
        : action === "validate"
          ? inspectionCreated
          : action === "decisions"
            ? decisionResponse
            : evidenceResponse,
    {
      service: "agricultural",
      method,
      body: input.data,
      operation: "agricultural.inspection.review",
    },
  );
}
