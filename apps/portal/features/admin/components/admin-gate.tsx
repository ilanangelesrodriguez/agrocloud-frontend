"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function AdminGate({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  if (user.isPending) return <p role="status">Verificando sesión…</p>;
  if (user.data?.rol?.codigo !== "SUPERADMIN") {
    return (
      <p role="alert">
        Este panel requiere acceso de superadministrador.{" "}
        <Link className="text-accent underline" href="/dashboard">Ir al panel empresarial</Link>
      </p>
    );
  }

  return children;
}
