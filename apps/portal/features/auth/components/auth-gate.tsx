"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ErrorState } from "@agrocloud/ui";

import { SessionLoading } from "./session-loading";
import { AuthRequestError } from "../request";
import { useCurrentUser } from "../hooks/use-current-user";

export function AuthGate({ children, signedOut }: { children: ReactNode; signedOut?: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const session = useCurrentUser(signedOut !== undefined);
  const unauthorized =
    session.isError && session.error instanceof AuthRequestError && session.error.status === 401;

  useEffect(() => {
    if (unauthorized && signedOut === undefined) {
      const next = encodeURIComponent(path);
      router.replace(`/login?next=${next}`);
    }
  }, [path, router, signedOut, unauthorized]);

  if (session.isPending || (signedOut !== undefined && session.isFetching)) {
    return <SessionLoading />;
  }

  if (unauthorized && signedOut !== undefined) return <>{signedOut}</>;

  if (unauthorized) return <SessionLoading label="Abriendo el inicio de sesión" />;

  if (session.isError) {
    return (
      <ErrorState
        className="mx-auto max-w-md py-16"
        error={session.error}
        retry={() => {
          void session.refetch();
        }}
        title="No se pudo validar el acceso"
      />
    );
  }

  return <>{children}</>;
}
