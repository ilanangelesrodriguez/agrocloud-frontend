import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/lib/auth/cookie-session";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { PortalHeader } from "@/features/auth/components/portal-header";

/** Fast redirect only: AuthGate and Identity perform real session verification. */
export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const cookieJar = await cookies();

  if (!cookieJar.has(SESSION_COOKIE)) redirect("/login");

  return (
    <AuthGate>
      <div className="flex min-h-dvh flex-col">
        <PortalHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-9 sm:px-8">{children}</main>
      </div>
    </AuthGate>
  );
}
