import type { NextRequest } from "next/server";
import { z } from "zod";

import { offerDetail, offerInput, offerKey, offerList } from "@/features/plans/schema";
import { adminIdentity } from "@/lib/auth/admin-route";
import { parseJson, reply } from "@/lib/auth/route-utils";

type Context = { params: Promise<{ key?: string[] }> };
async function getKey(context: Context) {
  const { key = [] } = await context.params;
  return key.length === 0 ? null : key.length === 1 ? offerKey.safeParse(key[0]).data : undefined;
}

export async function GET(request: NextRequest, context: Context) {
  const key = await getKey(context);
  if (key === undefined) return reply({ message: "Oferta inválida." }, 404);
  return adminIdentity(request, key ? "/billing-offers/" + key : "/billing-offers", key ? offerDetail : offerList);
}

async function save(request: NextRequest, context: Context, editing: boolean) {
  const key = await getKey(context);
  if (key === undefined || Boolean(key) !== editing) return reply({ message: "Oferta inválida." }, 404);
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const terms = offerInput.safeParse(json.body);
  if (!terms.success) return reply({ message: terms.error.issues[0]?.message ?? "Revisa los datos." }, 422);

  if (key) {
    const revision = z.object({ version: z.number().int().positive() }).safeParse(json.body);
    if (!revision.success) return reply({ message: "Falta la versión de la oferta." }, 422);
    return adminIdentity(request, "/billing-offers/" + key, offerDetail, { method: "PATCH", body: { ...terms.data, ...revision.data } });
  }

  const creation = z.object({ key: offerKey.refine((value) => value !== "new") }).safeParse(json.body);
  if (!creation.success) return reply({ message: "Ingresa una clave válida." }, 422);
  return adminIdentity(request, "/billing-offers", offerDetail, { body: { ...terms.data, ...creation.data, status: "DRAFT" } });
}

export function POST(request: NextRequest, context: Context) {
  return save(request, context, false);
}
export function PATCH(request: NextRequest, context: Context) {
  return save(request, context, true);
}
