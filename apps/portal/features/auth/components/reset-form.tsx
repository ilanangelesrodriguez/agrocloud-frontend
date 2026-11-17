"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Form, toast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { postAuth } from "../request";

import { AuthCard } from "./auth-card";
import { AuthField } from "./auth-field";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

import { passwordPair } from "@/lib/auth/schemas";

export function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const correo = params.get("correo");
  const token = params.get("token");
  const validLink = Boolean(correo && token);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof passwordPair>>({
    resolver: zodResolver(passwordPair),
  });
  const submit = handleSubmit(async (fields) => {
    if (!validLink || busy) return;
    setBusy(true);
    setError(null);
    try {
      await postAuth("/api/auth/reset-password", { ...fields, correo, token });
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      router.replace("/login?password-reset=1");
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo cambiar la contraseña.";
      setError(message);
      toast.danger(message);
    } finally {
      setBusy(false);
    }
  });

  return (
    <AuthCard
      description="Restablece tu contraseña. El enlace de recuperación es válido durante 60 minutos."
      footer={
        <Link className="font-semibold text-accent hover:underline" href="/forgot-password">
          Solicitar otro enlace
        </Link>
      }
      title="Nueva contraseña"
    >
      {!validLink ? (
        <FormFeedback message="El enlace de recuperación no es válido. Solicita otro enlace." />
      ) : (
        <Form className="space-y-5" validationBehavior="aria" onSubmit={submit}>
          <AuthField
            passwordToggle
            autoComplete="new-password"
            label="Nueva contraseña"
            {...register("password")}
            error={errors.password?.message}
          />
          <AuthField
            passwordToggle
            autoComplete="new-password"
            label="Confirmar contraseña"
            {...register("password_confirmation")}
            error={errors.password_confirmation?.message}
          />
          <p className="text-xs leading-6 text-muted">
            Al restablecer la contraseña, se cerrarán las sesiones anteriores de la cuenta.
          </p>
          <FormFeedback message={error} />
          <SubmitButton pending={busy}>Guardar contraseña</SubmitButton>
        </Form>
      )}
    </AuthCard>
  );
}
