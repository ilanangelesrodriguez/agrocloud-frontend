import type { NextRequest } from "next/server";

import { requestPageSchema } from "@/features/admin/schema";
import { adminIdentity, positiveInteger } from "@/lib/auth/admin-route";
import { reply } from "@/lib/auth/route-utils";

export function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") ?? "1";

  if (!positiveInteger(page)) return reply({ message: "Página inválida." }, 400);

  return adminIdentity(request, "/access-requests", requestPageSchema, { page: Number(page) });
}
