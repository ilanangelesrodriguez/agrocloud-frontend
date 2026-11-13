"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Button, Card, Typography } from "@heroui/react";
import { z } from "zod";

import { changeEmailSchema } from "@/lib/auth/schemas";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { postAuth } from "@/features/auth/request";
import { AuthField } from "@/features/auth/components/auth-field";
import { FormFeedback } from "@/features/auth/components/form-feedback";
import { SubmitButton } from "@/features/auth/components/submit-button";

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const cache = useQueryClient();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof changeEmailSchema>>({
    resolver: zodResolver(changeEmailSchema),
  });
  const submit = handleSubmit(async (data) => {
    if (pending) return;
    setPending(true);
    setFeedback(null);
    try {
      const result = (await postAuth("/api/auth/change-email", data)) as { message: string };

      setFeedback({ message: result.message, success: true });
      reset();
    } catch (e) {
      setFeedback({
        message: e instanceof Error ? e.message : "No fue posible solicitar el cambio.",
        success: false,
      });
    } finally {
      setPending(false);
    }
  });
  const closeAll = async () => {
    if (closing) return;
    setClosing(true);
    setFeedback(null);
    try {
      await postAuth("/api/auth/logout-all");
      cache.clear();
      router.replace("/login");
      router.refresh();
    } catch (e) {
      setFeedback({
        message: e instanceof Error ? e.message : "No se pudo cerrar las sesiones.",
        success: false,
      });
    } finally {
      setClosing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Cuenta y seguridad</p>
        <Typography.Heading className="mt-2 text-3xl font-semibold" level={1}>
          Mi perfil
        </Typography.Heading>
      </div>
      <Card className="border border-border bg-surface">
        <Card.Content className="space-y-3 p-6 sm:p-8">
          <Typography.Heading className="text-xl font-semibold" level={2}>
            Información de la cuenta
          </Typography.Heading>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Nombre</dt>
              <dd className="font-medium">
                {user.nombre} {user.apellido}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Correo</dt>
              <dd className="break-all font-medium">{user.correo}</dd>
            </div>
            <div>
              <dt className="text-muted">Rol</dt>
              <dd>{user.rol?.nombre ?? user.rol?.codigo ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Empresa</dt>
              <dd>{user.id_empresa ?? "Administración global"}</dd>
            </div>
          </dl>
        </Card.Content>
      </Card>
      <Card className="border border-border bg-surface">
        <Card.Content className="p-6 sm:p-8">
          <Typography.Heading className="text-xl font-semibold" level={2}>
            Cambiar correo electrónico
          </Typography.Heading>
          <p className="mt-2 mb-5 text-sm text-muted">
            Te enviaremos un enlace al nuevo correo. La dirección anterior seguirá activa hasta
            confirmarlo.
          </p>
          <Form className="space-y-5" validationBehavior="aria" onSubmit={submit}>
            <AuthField
              autoComplete="email"
              label="Nuevo correo"
              type="email"
              {...register("correo")}
              error={errors.correo?.message}
            />
            <AuthField
              passwordToggle
              autoComplete="current-password"
              label="Contraseña actual"
              {...register("current_password")}
              error={errors.current_password?.message}
            />
            <FormFeedback message={feedback?.message} success={feedback?.success} />
            <SubmitButton pending={pending}>Solicitar cambio</SubmitButton>
          </Form>
        </Card.Content>
      </Card>
      <Card className="border border-border bg-surface">
        <Card.Content className="p-6 sm:p-8">
          <Typography.Heading className="text-xl font-semibold" level={2}>
            Sesiones activas
          </Typography.Heading>
          <p className="my-4 text-sm text-muted">
            Si sospechas que alguien utilizó tu cuenta, cierra todas las sesiones e inicia sesión
            nuevamente.
          </p>
          <Button
            isDisabled={closing}
            variant="secondary"
            onPress={() => {
              void closeAll();
            }}
          >
            {closing ? "Cerrando…" : "Cerrar sesión en todos los dispositivos"}
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}
