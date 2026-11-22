"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ImageEditor } from "@/components/image-editor";

export function CompanyLogoEditor({
  logoUrl,
  companyName,
  canEdit,
  compact = false,
}: {
  logoUrl?: string | null;
  companyName: string;
  canEdit: boolean;
  compact?: boolean;
}) {
  const cache = useQueryClient();
  async function send(method: "POST" | "DELETE", file?: File) {
    const form = file ? new FormData() : undefined;
    if (file) form!.append("logo", file);
    const response = await fetch("/api/company/logo", { method, body: form, cache: "no-store" });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok)
      throw new Error(
        data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : "No se pudo actualizar el logo.",
      );
    await Promise.all([
      cache.invalidateQueries({ queryKey: ["company", "profile"] }),
      cache.invalidateQueries({ queryKey: ["auth", "me"] }),
    ]);
  }
  return (
    <section
      className={
        compact
          ? "w-full shrink-0 space-y-3 sm:w-56"
          : "space-y-4 rounded-xl border border-border bg-surface p-5"
      }
    >
      {!compact ? (
        <div>
          <h3 className="text-sm font-semibold">Logo de la empresa</h3>
          <p className="mt-1 text-xs text-muted">
            Identifica a tu organización en el portal. Revisa la imagen antes de guardar.
          </p>
        </div>
      ) : null}
      <ImageEditor
        imageUrl={logoUrl}
        label={"Logo de " + companyName}
        initials={companyName
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toUpperCase()}
        square
        canEdit={canEdit}
        maxBytes={4 * 1024 * 1024}
        onSave={(file) => send("POST", file)}
        onRemove={() => send("DELETE")}
      />
    </section>
  );
}
