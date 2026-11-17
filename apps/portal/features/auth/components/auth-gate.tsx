"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@agrocloud/ui";

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
    return (
      <LoadingState
        className="mx-auto max-w-md py-16"
        label="Verificando sesión"
        variant="spinner"
      />
    );
  }

  if (unauthorized && signedOut !== undefined) return <>{signedOut}</>;

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
