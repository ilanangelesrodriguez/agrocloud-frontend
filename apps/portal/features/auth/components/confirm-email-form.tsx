"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { postAuth } from "../request";
import { AuthCard } from "./auth-card";
import { FormFeedback } from "./form-feedback";

export function ConfirmEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.get("user_id");
  const token = params.get("token");
  const valid = Boolean(userId && /^\d+$/.test(userId) && token && token.length <= 128);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await postAuth("/api/auth/confirm-email", { user_id: Number(userId), token });
      queryClient.clear();
      router.replace("/login?email-confirmed=1");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar el cambio de correo.");
    } finally { setBusy(false); }
  };
  return (
    <AuthCard title="Confirmar nuevo correo" description="Verifica el cambio de dirección de tu cuenta AgroCloud. Este enlace vence en 24 horas."
      footer={<Link href="/login" className="font-semibold text-accent hover:underline">Volver al acceso</Link>}>
      {!valid && <FormFeedback message="El enlace de confirmación es inválido o incompleto." />}
      <FormFeedback message={error} />
      <Button className="w-full min-h-12" variant="primary" isDisabled={!valid || busy} onPress={() => { void confirm(); }}>
        {busy ? "Confirmando…" : "Confirmar correo"}
      </Button>
    </AuthCard>
  );
}
