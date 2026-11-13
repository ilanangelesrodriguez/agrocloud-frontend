"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@agrocloud/ui";

import { AuthRequestError } from "../request";
import { useCurrentUser } from "../hooks/use-current-user";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const session = useCurrentUser();

  useEffect(() => {
    if (
      session.isError &&
      session.error instanceof AuthRequestError &&
      session.error.status === 401
    ) {
      const next = encodeURIComponent(path);
      router.replace(`/login?next=${next}`);
    }
  }, [path, router, session.error, session.isError]);

  if (session.isPending) {
    return (
      <LoadingState
        className="mx-auto max-w-md py-16"
        label="Verificando sesión"
        variant="spinner"
      />
    );
  }

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
