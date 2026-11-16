import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PortalEntry } from "@/features/auth/components/portal-entry";
import { SESSION_COOKIE, unseal } from "@/lib/auth/cookie-session";

export default async function Page() {
  const cookieJar = await cookies();

  if (!unseal(cookieJar.get(SESSION_COOKIE)?.value)) redirect("/login");

  return <PortalEntry />;
}
