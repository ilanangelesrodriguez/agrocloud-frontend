import type { NextRequest } from "next/server";
import { z } from "zod";
import { authorizedIdentity } from "@/lib/auth/authorized-identity";
import { parseJson, reply } from "@/lib/auth/route-utils";
import { canManageCompany } from "@/features/company/navigation";
import {
  inboxResponse,
  unreadResponse,
  readResponse,
  readAllResponse,
  preferencesResponse,
  preferencesInput,
} from "@/features/notifications/schema";

type Context = { params: Promise<{ resource?: string[] }> };
export async function GET(request: NextRequest, { params }: Context) {
  const parts = (await params).resource ?? [];
  const path = parts.join("/");
  if (parts.length > 1 || !["", "unread-count", "preferences"].includes(path))
    return reply({ message: "Recurso no encontrado." }, 404);
  const query = request.nextUrl.searchParams;
  const limit = query.get("limit") ?? "25";
  const cursor = query.get("cursor") ?? undefined;
  const unread = query.get("unread") ?? undefined;
  if (
    !/^[1-9]\d{0,2}$/.test(limit) ||
    Number(limit) > 100 ||
    (cursor !== undefined && !/^[1-9]\d{0,18}$/.test(cursor)) ||
    (unread !== undefined && !["true", "false"].includes(unread))
  )
    return reply({ message: "Paginación inválida." }, 400);
  return authorizedIdentity(
    request,
    (user) => (canManageCompany(user) ? "/" + path : null),
    path === "preferences"
      ? preferencesResponse
      : path === "unread-count"
        ? unreadResponse
        : inboxResponse,
    {
      service: "notifications",
      ...(path
        ? {}
        : {
            notificationQuery: {
              limit: Number(limit),
              cursor,
              unread: unread === undefined ? undefined : unread === "true",
            },
          }),
    },
  );
}
export async function PATCH(request: NextRequest, { params }: Context) {
  const parts = (await params).resource ?? [];
  const all = parts.length === 1 && parts[0] === "read-all";
  if (!all && !(parts.length === 2 && parts[1] === "read" && z.uuid().safeParse(parts[0]).success))
    return reply({ message: "Recurso no encontrado." }, 404);
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  return authorizedIdentity(
    request,
    (user) => (canManageCompany(user) ? "/" + parts.join("/") : null),
    all ? readAllResponse : readResponse,
    { service: "notifications", method: "PATCH", body: {} },
  );
}
export async function PUT(request: NextRequest, { params }: Context) {
  const parts = (await params).resource ?? [];
  if (parts.length !== 1 || parts[0] !== "preferences")
    return reply({ message: "Recurso no encontrado." }, 404);
  const json = await parseJson(request);
  if (!json.ok) return json.response;
  const input = preferencesInput.safeParse(json.body);
  if (!input.success) return reply({ message: "Revisa tus preferencias." }, 422);
  return authorizedIdentity(
    request,
    (user) => (canManageCompany(user) ? "/preferences" : null),
    preferencesResponse,
    { service: "notifications", method: "PUT", body: input.data },
  );
}
