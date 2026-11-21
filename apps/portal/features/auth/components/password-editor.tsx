"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { postAuth } from "../request";

export function PasswordEditor() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const cache = useQueryClient();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const current_password = String(data.get("current_password") || "");
    const password = String(data.get("password") || "");
    const password_confirmation = String(data.get("password_confirmation") || "");
    if (password !== password_confirmation) { toast.danger("Las contraseñas no coinciden."); return; }
    setBusy(true);
    try {
      await postAuth("/api/auth/change-password", { current_password, password, password_confirmation });
      cache.clear();
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      router.replace("/login"); router.refresh();
    } catch (error) { toast.danger(error instanceof Error ? error.message : "No se pudo cambiar la contraseña."); setBusy(false); }
  }
  return <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
    <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
    <p className="text-sm text-muted">Usa tu contraseña actual. Se cerrarán las demás sesiones.</p>
    <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
      <TextField name="current_password" isRequired><Label>Contraseña actual</Label><Input type="password" autoComplete="current-password" /></TextField>
      <TextField name="password" isRequired><Label>Nueva contraseña</Label><Input type="password" autoComplete="new-password" minLength={12} /></TextField>
      <TextField name="password_confirmation" isRequired><Label>Confirma la nueva contraseña</Label><Input type="password" autoComplete="new-password" minLength={12} /></TextField>
      <div className="flex justify-end"><Button type="submit" variant="primary" isDisabled={busy}>{busy ? "Actualizando…" : "Cambiar contraseña"}</Button></div>
    </form>
  </section>;
}
