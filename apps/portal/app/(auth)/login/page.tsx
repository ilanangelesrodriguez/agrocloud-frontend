import type { Metadata } from "next";

import { Suspense } from "react";
import { cookies } from "next/headers";

import { SessionLoading } from "@/features/auth/components/session-loading";
import { LoginForm } from "@/features/auth/components/login-form";
import { PortalEntry } from "@/features/auth/components/portal-entry";
import { SESSION_COOKIE, unseal } from "@/lib/auth/cookie-session";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; offer?: string | string[] }>;
}) {
  const cookieJar = await cookies();
  const form = (
    <Suspense fallback={<SessionLoading label="Preparando el acceso" />}>
      <LoginForm />
    </Suspense>
  );

  if (!unseal(cookieJar.get(SESSION_COOKIE)?.value)) return form;

  const { next, offer } = await searchParams;

  return (
    <PortalEntry
      requestedPath={typeof next === "string" ? next : undefined}
      requestedOffer={typeof offer === "string" ? offer : undefined}
      signedOut={form}
    />
  );
}
