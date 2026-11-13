"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Alert, Button, Spinner } from "@heroui/react";

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

  if (session.isPending)
    return (
      <div className="grid min-h-[60vh] place-items-center" role="status">
        <Spinner size="lg" />
        <span className="sr-only">Verificando sesión</span>
      </div>
    );
  if (session.isError)
    return (
      <div className="mx-auto max-w-md py-16">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>No se pudo validar el acceso</Alert.Title>
            <Alert.Description>{session.error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button
          className="mt-4"
          variant="secondary"
          onPress={() => {
            void session.refetch();
          }}
        >
          Reintentar
        </Button>
      </div>
    );

  return <>{children}</>;
}
