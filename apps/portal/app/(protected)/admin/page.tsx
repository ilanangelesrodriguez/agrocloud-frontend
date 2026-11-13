"use client";

import Link from "next/link";
import { Alert, Card, Typography } from "@heroui/react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export default function AdminPage() {
  const { data: user } = useCurrentUser();
  if (!user) return null;
  if (user.rol?.codigo !== "SUPERADMIN") return (
    <Alert status="danger"><Alert.Indicator /><Alert.Content>
      <Alert.Title>Acceso restringido</Alert.Title>
      <Alert.Description>Este panel es exclusivo del administrador global. <Link className="underline" href="/dashboard">Ir al panel empresarial</Link>.</Alert.Description>
    </Alert.Content></Alert>
  );
  return (
    <div className="space-y-7">
      <div><p className="text-sm font-semibold text-accent">Administración global</p>
        <Typography.Heading level={1} className="mt-2 text-3xl font-semibold">Panel de plataforma</Typography.Heading>
        <Typography.Paragraph className="mt-3 text-muted">Inicio de sesión superadmin verificado. Las pantallas de solicitudes, empresas y suscripciones se implementan por separado.</Typography.Paragraph>
      </div>
      <Card className="border border-border bg-surface"><Card.Content className="p-6">
        <p className="font-semibold">Sesión de administración</p>
        <p className="mt-2 text-sm text-muted">{user.nombre} {user.apellido} · {user.correo}</p>
        <Link className="mt-4 inline-flex text-sm font-semibold text-accent hover:underline" href="/settings/profile">Ver opciones de seguridad</Link>
      </Card.Content></Card>
    </div>
  );
}
