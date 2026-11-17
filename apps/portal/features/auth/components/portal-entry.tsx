"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionLoading } from "./session-loading";

import { offerKey } from "@/features/plans/schema";
import { homeForUser, safeNext } from "@/lib/auth/schemas";

import { useCurrentUser } from "../hooks/use-current-user";
import { AuthGate } from "./auth-gate";

type EntryDestination = { requestedPath?: string; requestedOffer?: string };

function RedirectToHome({ requestedPath, requestedOffer }: EntryDestination) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const home = user ? homeForUser(user) : undefined;
  const target = home ? safeNext(requestedPath, home) : undefined;
  const offer = offerKey.safeParse(requestedOffer);
  const destination =
    home === "/dashboard" && target === "/settings/subscription" && offer.success
      ? target + "?" + new URLSearchParams({ offer: offer.data })
      : home;

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  return <SessionLoading label="Abriendo tu espacio de trabajo" />;
}

export function PortalEntry({
  requestedPath,
  requestedOffer,
  signedOut,
}: EntryDestination & { signedOut?: ReactNode }) {
  return (
    <AuthGate signedOut={signedOut}>
      <RedirectToHome requestedOffer={requestedOffer} requestedPath={requestedPath} />
    </AuthGate>
  );
}
