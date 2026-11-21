"use client";

import { useState, type FormEvent } from "react";
import { Avatar, Button, Input, Label, TextField, toast, FieldError, Form } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import type { IdentityUser } from "@/lib/auth/schemas";
import { authRequest } from "../request";

export function ProfileEditor({ user }: { user: IdentityUser }) {
  const cache = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    const body = {
      nombre: String(fields.get("nombre") ?? "").trim(),
      apellido: String(fields.get("apellido") ?? "").trim() || null,
      telefono: String(fields.get("telefono") ?? "").trim() || null,
    };
    if (body.nombre.length < 2) {
      setFieldErrors({ nombre: "Ingresa al menos dos caracteres para el nombre." });
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      await authRequest("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await cache.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Datos personales actualizados");
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudo actualizar tu perfil.");
    } finally {
      setSaving(false);
    }
  }
  async function upload(file: File | undefined) {
    if (!file || uploading) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      toast.danger("Utiliza una imagen JPG, PNG o WebP de hasta 2 MB.");
      return;
    }
    setUploading(true);
    const body = new FormData();
    body.append("avatar", file);
    try {
      await authRequest("/api/auth/avatar", { method: "POST", body });
      await cache.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Fotografía actualizada");
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }
  async function remove() {
    if (removing) return;
    setRemoving(true);
    try {
      await authRequest("/api/auth/avatar", { method: "DELETE" });
      await cache.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Fotografía eliminada");
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudo eliminar la imagen.");
    } finally {
      setRemoving(false);
    }
  }
  const initials = [user.nombre, user.apellido]
    .filter(Boolean)
    .map((name) => name!.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Datos personales</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-20 text-2xl">
          {user.foto_perfil_url ? (
            <Avatar.Image src={user.foto_perfil_url} alt="Fotografía de perfil" />
          ) : null}
          <Avatar.Fallback>{initials || "AC"}</Avatar.Fallback>
        </Avatar>
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-default">
            {uploading ? "Subiendo…" : "Cambiar fotografía"}
            <input
              aria-label="Seleccionar fotografía"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading || removing}
              onChange={(e) => {
                void upload(e.currentTarget.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
          </label>
          {user.foto_perfil_url ? (
            <Button
              type="button"
              variant="tertiary"
              isDisabled={removing || uploading}
              onPress={() => void remove()}
            >
              Eliminar foto
            </Button>
          ) : null}
          <p className="text-xs text-muted">JPG, PNG o WebP. Máximo 2 MB.</p>
        </div>
      </div>
      <Form
        onInputCapture={() => setFieldErrors({})}
        validationErrors={fieldErrors}
        validationBehavior="native"
        onSubmit={(event) => void save(event)}
        className="grid gap-4 sm:grid-cols-2"
      >
        <TextField
          variant="secondary"
          name="nombre"
          defaultValue={user.nombre}
          minLength={2}
          isRequired
        >
          <Label>Nombre</Label>
          <Input placeholder="Ej. María" variant="secondary" maxLength={150} />
          <FieldError />
        </TextField>
        <TextField variant="secondary" name="apellido" defaultValue={user.apellido ?? ""}>
          <Label>Apellido</Label>
          <Input placeholder="Ej. García" variant="secondary" maxLength={150} />
          <FieldError />
        </TextField>
        <TextField
          variant="secondary"
          name="telefono"
          defaultValue={user.telefono ?? ""}
          type="tel"
        >
          <Label>Teléfono</Label>
          <Input placeholder="Ej. 987 654 321" variant="secondary" maxLength={30} />
          <FieldError />
        </TextField>
        <div className="flex items-end justify-end">
          <Button type="submit" variant="primary" isDisabled={saving}>
            {saving ? "Guardando…" : "Guardar datos"}
          </Button>
        </div>
      </Form>
      <p className="text-xs text-muted">
        El rol, cargo, empresa y permisos se gestionan desde administración, no desde este
        formulario.
      </p>
    </section>
  );
}
