"use client";

import { useState } from "react";
import { Avatar, Button, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

export function CompanyLogoEditor({ logoUrl, companyName, canEdit }: {
  logoUrl?: string | null;
  companyName: string;
  canEdit: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const cache = useQueryClient();
  async function send(method: "POST" | "DELETE", file?: File) {
    if (busy || (method === "POST" && !file)) return;
    if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024)) {
      toast.danger("JPG, PNG o WebP. Máximo 4 MB."); return;
    }
    setBusy(true);
    try {
      const form = file ? new FormData() : undefined;
      if (file) form!.append("logo", file);
      const response = await fetch("/api/company/logo", { method, body: form, cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "No se pudo actualizar el logo.");
      await cache.invalidateQueries({ queryKey: ["company", "profile"] });
      toast.success("Logo empresarial actualizado");
    } catch (error) { toast.danger(error instanceof Error ? error.message : "No se pudo guardar el logo."); }
    finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
    <Avatar className="size-20 rounded-xl">
      {logoUrl ? <Avatar.Image src={logoUrl} alt={`Logo de ${companyName}`} /> : null}
      <Avatar.Fallback>{companyName.trim().slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar>
    <div className="min-w-0 space-y-2">
      <p className="text-sm font-semibold">Logo de la empresa</p>
      {canEdit ? <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-default">
          {busy ? "Guardando…" : "Subir logo"}
          <input className="sr-only" aria-label="Seleccionar logo" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy}
            onChange={(e) => { void send("POST", e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
        </label>
        {logoUrl ? <Button variant="tertiary" isDisabled={busy} onPress={() => void send("DELETE")}>Eliminar</Button> : null}
      </div> : null}
      <p className="text-xs text-muted">PNG, JPG o WebP. Hasta 4 MB. Solo administradores autorizados.</p>
    </div>
  </div>;
}
