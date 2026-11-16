"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Form } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { postAuth } from "../request";

import { AuthField } from "./auth-field";
import { AuthCard } from "./auth-card";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

import { loginSchema, safeNext } from "@/lib/auth/schemas";
import { offerKey } from "@/features/plans/schema";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: "", password: "" },
  });

  const submit = handleSubmit(async (fields) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = (await postAuth("/api/auth/login", fields)) as {
        redirectTo: string;
        user: { rol: { codigo: string } | null };
      };

      queryClient.clear();
      const target = safeNext(params.get("next"), result.redirectTo);
      const restricted =
        (target.startsWith("/admin") && result.user.rol?.codigo !== "SUPERADMIN") ||
        (target.startsWith("/dashboard") && result.user.rol?.codigo === "SUPERADMIN");

      const requestedOffer = offerKey.safeParse(params.get("offer"));
      const subscription = target === "/settings/subscription";
      const destination =
        subscription && requestedOffer.success
          ? target + "?" + new URLSearchParams({ offer: requestedOffer.data })
          : target;

      router.replace(
        restricted || (subscription && result.user.rol?.codigo === "SUPERADMIN")
          ? result.redirectTo
          : destination,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  });

  return (
    <AuthCard
      description="Ingresa con el correo y la contraseña de tu cuenta empresarial."
      footer={
        process.env.NEXT_PUBLIC_MARKETING_URL ? (
          <>
            ¿Tu organización aún no tiene acceso?{" "}
            <a
              className="font-semibold text-accent underline"
              href={process.env.NEXT_PUBLIC_MARKETING_URL}
            >
              Solicitar acceso
            </a>
          </>
        ) : undefined
      }
      title="Bienvenido a AgroCloud"
    >
      <Form className="space-y-5" validationBehavior="aria" onSubmit={submit}>
        <AuthField
          autoComplete="email"
          label="Correo electrónico"
          placeholder="nombre@empresa.com"
          type="email"
          {...register("correo")}
          error={errors.correo?.message}
        />
        <AuthField
          autoComplete="current-password"
          label="Contraseña"
          placeholder="Tu contraseña"
          {...register("password")}
          passwordToggle
          error={errors.password?.message}
        />
        <div className="flex justify-end">
          <Link className="text-sm font-medium text-accent hover:underline" href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <FormFeedback
          success
          message={
            error
              ? null
              : params.has("activated")
                ? "Cuenta activada. Ingresa con tu contraseña."
                : params.has("password-reset")
                  ? "Contraseña actualizada. Inicia sesión nuevamente."
                  : params.has("email-confirmed")
                    ? "Correo confirmado. Inicia sesión nuevamente."
                    : null
          }
        />
        <FormFeedback message={error} />
        <SubmitButton pending={busy}>
          {busy ? "Validando acceso…" : "Ingresar al portal"}
        </SubmitButton>
      </Form>
    </AuthCard>
  );
}
