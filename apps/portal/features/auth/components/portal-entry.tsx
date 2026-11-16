"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@agrocloud/ui";

import { homeForUser } from "@/lib/auth/schemas";

import { useCurrentUser } from "../hooks/use-current-user";
import { AuthGate } from "./auth-gate";

function RedirectToHome() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const destination = user ? homeForUser(user) : undefined;

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  return (
    <LoadingState className="mx-auto max-w-md py-16" label="Abriendo el portal" variant="spinner" />
  );
}

export function PortalEntry() {
  return (
    <AuthGate>
      <RedirectToHome />
    </AuthGate>
  );
}
