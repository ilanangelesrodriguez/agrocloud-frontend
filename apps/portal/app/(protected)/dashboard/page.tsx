"use client";

import Link from "next/link";
import { Alert, Card, Typography } from "@heroui/react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  if (!user) return null;
  if (user.rol?.codigo === "SUPERADMIN") return <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Description>El administrador global utiliza el <Link href="/admin" className="underline">panel de plataforma</Link>.</Alert.Description></Alert.Content></Alert>;
  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-accent">Portal empresarial</p>
        <Typography.Heading level={1} className="mt-2 text-3xl font-semibold">Bienvenido, {user.nombre}</Typography.Heading>
        <Typography.Paragraph className="mt-3 text-muted">Tu sesión está activa. Los módulos agrícolas se conectarán en la siguiente etapa.</Typography.Paragraph>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-border bg-surface"><Card.Content className="p-6"><p className="text-sm text-muted">Empresa asignada</p><p className="mt-2 text-xl font-semibold">{user.id_empresa ?? "Sin asignar"}</p></Card.Content></Card>
        <Card className="border border-border bg-surface"><Card.Content className="p-6"><p className="text-sm text-muted">Rol actual</p><p className="mt-2 text-xl font-semibold">{user.rol?.nombre ?? user.rol?.codigo ?? "Sin rol"}</p></Card.Content></Card>
      </div>
      <Link className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground" href="/settings/profile">Administrar mi cuenta</Link>
    </div>
  );
}
