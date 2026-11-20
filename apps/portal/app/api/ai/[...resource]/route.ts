import type { NextRequest } from "next/server";
import type { z } from "zod";
import { authorizedIdentity } from "@/lib/auth/authorized-identity";
import { reply } from "@/lib/auth/route-utils";
import { canReadModel, canMonitorAi, canReadAiHistory } from "@/features/ai/policy";
import {
  aiModel,
  aiEvaluation,
  aiVersions,
  confusionMatrix,
  technicalOverview,
  technicalClasses,
  technicalDaily,
  technicalErrors,
  inferencePage,
  inferenceResult,
  aiHealth,
  aiReady,
} from "@/features/ai/schema";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string[] }> },
) {
  const segments = (await params).resource;
  const resource = segments.join("/");
  const scientific: Record<string, z.ZodType<object>> = {
    model: aiModel,
    "model/evaluation": aiEvaluation,
    "model/versions": aiVersions,
    "model/confusion-matrix": confusionMatrix,
  };
  const technical: Record<string, z.ZodType<object>> = {
    "stats/overview": technicalOverview,
    "stats/classes": technicalClasses,
    "stats/daily": technicalDaily,
    "stats/errors": technicalErrors,
    health: aiHealth,
    ready: aiReady,
  };
  const detail =
    segments.length === 2 &&
    segments[0] === "inferences" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segments[1]);
  const schema =
    scientific[resource] ??
    technical[resource] ??
    (resource === "inferences" ? inferencePage : detail ? inferenceResult : undefined);
  if (!schema) return reply({ message: "Consulta de IA no disponible." }, 404);
  const days = Number(request.nextUrl.searchParams.get("days") ?? 30);
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 30);
  const version = Number(request.nextUrl.searchParams.get("version") ?? 2);
  const model = request.nextUrl.searchParams.get("model_id") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 365 ||
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(version) ||
    version < 1 ||
    (model && model.length > 200) ||
    (status && !["processing", "completed", "failed"].includes(status))
  )
    return reply({ message: "Filtros de IA inválidos." }, 422);
  return authorizedIdentity(
    request,
    (user) =>
      (
        scientific[resource]
          ? canReadModel(user)
          : resource.startsWith("inferences")
            ? canReadAiHistory(user)
            : canMonitorAi(user)
      )
        ? "/" + resource
        : null,
    schema,
    {
      service: "ai",
      aiQuery: { days, model_id: model, offset, limit, status, version },
      operation: "ai.read",
    },
  );
}
