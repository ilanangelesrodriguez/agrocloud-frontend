"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { postAuth } from "../request";

import { AuthCard } from "./auth-card";
import { AuthField } from "./auth-field";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

import { passwordPair } from "@/lib/auth/schemas";

export function ActivateForm() {
  const params = useSearchParams();
  const router = useRouter();
  const userId = params.get("user_id");
  const token = params.get("token");
  const validLink = Boolean(userId && /^\d+$/.test(userId) && token && token.length <= 128);
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
      await postAuth("/api/auth/activate", { ...fields, user_id: Number(userId), token });
      router.replace("/login?activated=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo activar la cuenta.");
    } finally {
      setBusy(false);
    }
  });

  return (
    <AuthCard
      description="Crea una contraseña personal para tu usuario de AgroCloud. La invitación tiene una vigencia de 72 horas."
      footer={
        <Link className="font-semibold text-accent hover:underline" href="/login">
          Volver al acceso
        </Link>
      }
      title="Activa tu cuenta"
    >
      {!validLink ? (
        <FormFeedback message="El enlace de invitación es inválido o incompleto. Solicita que te envíen una nueva invitación." />
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
            Usa al menos 12 caracteres, incluyendo mayúsculas, minúsculas y números.
          </p>
          <FormFeedback message={error} />
          <SubmitButton pending={busy}>Activar cuenta</SubmitButton>
        </Form>
      )}
    </AuthCard>
  );
}
