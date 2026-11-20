import type { z } from "zod";
import { bffRequest } from "@/lib/api/bff-client";
import {
  inboxResponse,
  unreadResponse,
  readResponse,
  readAllResponse,
  preferencesResponse,
} from "./schema";
import type { preferencesInput } from "./schema";

export function fetchInbox(cursor: string | undefined, unread: boolean, signal?: AbortSignal) {
  const query = new URLSearchParams({ limit: "25", unread: String(unread) });
  if (cursor) query.set("cursor", cursor);
  return bffRequest("?" + query, inboxResponse, { signal }, "notifications");
}
export function fetchUnread(signal?: AbortSignal) {
  return bffRequest("unread-count", unreadResponse, { signal }, "notifications");
}
export async function readNotification(id?: string) {
  const options = { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" };
  return id
    ? await bffRequest(id + "/read", readResponse, options, "notifications")
    : await bffRequest("read-all", readAllResponse, options, "notifications");
}
export function fetchPreferences(signal?: AbortSignal) {
  return bffRequest("preferences", preferencesResponse, { signal }, "notifications");
}
export function savePreferences(input: z.infer<typeof preferencesInput>) {
  return bffRequest(
    "preferences",
    preferencesResponse,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "notifications",
  );
}
