"use client";

import { useState } from "react";
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

import { forgotSchema } from "@/lib/auth/schemas";

export function ForgotForm() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  const submit = handleSubmit(async (fields) => {
    if (pending) return;
    setPending(true);
    setFeedback(null);
    try {
      const response = (await postAuth("/api/auth/forgot-password", fields)) as { message: string };

      setFeedback({ message: response.message, success: true });
      toast.success("Solicitud registrada", { description: response.message });
    } catch (e) {
      toast.danger(e instanceof Error ? e.message : "No se pudo completar la solicitud.");
      setFeedback({
        message: e instanceof Error ? e.message : "No se pudo completar la solicitud.",
        success: false,
      });
    } finally {
      setPending(false);
    }
  });

  return (
    <AuthCard
      description="Escribe tu correo. Si la cuenta está habilitada, recibirás un enlace para restablecer la contraseña."
      footer={
        <Link className="font-semibold text-accent hover:underline" href="/login">
          Volver a inicio de sesión
        </Link>
      }
      title="Recuperar acceso"
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
        <FormFeedback message={feedback?.message} success={feedback?.success} />
        <SubmitButton pending={pending}>Enviar instrucciones</SubmitButton>
      </Form>
    </AuthCard>
  );
}
