import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { SESSION_COOKIE } from "@/lib/auth/cookie-session";

/** Redirección preliminar; AuthGate y el backend verifican la sesión real. */
export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const cookieJar = await cookies();

  if (!cookieJar.has(SESSION_COOKIE)) redirect("/login");

  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
