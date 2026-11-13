import { bffRequest } from "@/lib/api/bff-client";
import type { UserScope } from "./policy";
import { usersSchema, userSchema, invitationSchema } from "@/features/company/users/schema";

export function listUsers(scope: UserScope, page: number, signal?: AbortSignal) {
  return bffRequest("users?page=" + page, usersSchema, { signal }, scope);
}
export function getUser(scope: UserScope, id: string, signal?: AbortSignal) {
  return bffRequest("users/" + id, userSchema, { signal }, scope);
}
export async function saveUserOperation(
  scope: UserScope,
  id: number | undefined,
  operation: { kind: "save" | "resend"; body: object },
) {
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify(operation.body);
  if (operation.kind === "resend" && id) {
    await bffRequest(
      "users/" + id + "/invitation",
      invitationSchema,
      {
        method: "POST",
        headers,
        body,
      },
      scope,
    );
    return;
  }
  await bffRequest(
    id ? "users/" + id : "users",
    userSchema,
    {
      method: id ? "PATCH" : "POST",
      headers,
      body,
    },
    scope,
  );
}
