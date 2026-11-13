import type { NextRequest } from "next/server";

import { companyPageSchema } from "@/features/admin/schema";
import { adminIdentity, positiveInteger } from "@/lib/auth/admin-route";
import { reply } from "@/lib/auth/route-utils";

export function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  if (!positiveInteger(page)) return reply({ message: "Página inválida." }, 400);

  return adminIdentity(request, "/companies", companyPageSchema, { page: Number(page) });
}
