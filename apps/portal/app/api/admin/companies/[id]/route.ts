import type { NextRequest } from "next/server";

import { companyResponseSchema } from "@/features/admin/schema";
import { adminIdentity, positiveInteger } from "@/lib/auth/admin-route";
import { reply } from "@/lib/auth/route-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) return reply({ message: "Empresa inválida." }, 400);

  return adminIdentity(request, "/companies/" + id, companyResponseSchema);
}
