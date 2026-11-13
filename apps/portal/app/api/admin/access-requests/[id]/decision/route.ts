import type { NextRequest } from "next/server";

import { decisionResponseSchema, decisionSchema } from "@/features/admin/schema";
import { adminIdentity, positiveInteger } from "@/lib/auth/admin-route";
import { parseJson, reply } from "@/lib/auth/route-utils";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!positiveInteger(id)) return reply({ message: "Solicitud inválida." }, 400);
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const decision = decisionSchema.safeParse(json.body);
  if (!decision.success) {
    return reply({ message: decision.error.issues[0]?.message ?? "Decisión inválida." }, 422);
  }

  return adminIdentity(request, "/access-requests/" + id + "/decision", decisionResponseSchema, {
    body: decision.data,
  });
}
