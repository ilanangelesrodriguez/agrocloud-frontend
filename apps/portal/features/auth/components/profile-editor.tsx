"use client";

import type { IdentityUser } from "@/lib/auth/schemas";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Input, Label, TextField, toast, FieldError, Form } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

import { authRequest } from "../request";

type ProfileValues = { nombre: string; apellido: string; telefono: string };
export function ProfileEditor({
  user,
  onDirtyChange,
  onBusyChange,
}: {
  user: IdentityUser;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const cache = useQueryClient();
  const [baseline, setBaseline] = useState<ProfileValues>({
    nombre: user.nombre,
    apellido: user.apellido ?? "",
    telefono: user.telefono ?? "",
  });
  const [values, setValues] = useState(baseline);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const normalized = {
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
    telefono: values.telefono.trim(),
  };
  const dirty = Object.keys(normalized).some(
    (key) => normalized[key as keyof ProfileValues] !== baseline[key as keyof ProfileValues],
  );
  const errors = {
    nombre:
      normalized.nombre.length < 2
        ? "Ingresa al menos dos caracteres."
        : normalized.nombre.length > 150
          ? "Usa hasta 150 caracteres."
          : "",
    apellido: normalized.apellido.length > 150 ? "Usa hasta 150 caracteres." : "",
    telefono: normalized.telefono.length > 30 ? "Usa hasta 30 caracteres." : "",
  };
  const valid = !Object.values(errors).some(Boolean);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange?.(saving);
  }, [saving, onBusyChange]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !dirty) return;
    if (!valid) {
      setTouched({ nombre: true, apellido: true, telefono: true });

      return;
    }
    setSaving(true);
    try {
      await authRequest("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...normalized,
          apellido: normalized.apellido || null,
          telefono: normalized.telefono || null,
        }),
      });
      setBaseline(normalized);
      setValues(normalized);
      setTouched({});
      await cache.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Datos personales actualizados");
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudo actualizar tu perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div>
        <h2 className="text-lg font-semibold">Datos personales</h2>
        <p className="mt-1 text-sm text-muted">
          Mantén actualizada la información de contacto de tu cuenta.
        </p>
      </div>
      <Form
        className="grid gap-5 sm:grid-cols-2"
        validationBehavior="aria"
        onSubmit={(event) => void save(event)}
      >
        {(
          [
            ["nombre", "Nombre", "Ej. María", 150],
            ["apellido", "Apellido", "Ej. García", 150],
            ["telefono", "Teléfono", "Ej. 987 654 321", 30],
          ] as const
        ).map(([name, label, placeholder, max]) => (
          <TextField
            key={name}
            isDisabled={saving}
            isInvalid={!!touched[name] && !!errors[name]}
            isRequired={name === "nombre"}
            name={name}
            type={name === "telefono" ? "tel" : "text"}
            value={values[name]}
            variant="secondary"
            onBlur={() => setTouched((current) => ({ ...current, [name]: true }))}
            onChange={(value) => setValues((current) => ({ ...current, [name]: value }))}
          >
            <Label>{label}</Label>
            <Input
              autoComplete={
                name === "nombre" ? "given-name" : name === "apellido" ? "family-name" : "tel"
              }
              maxLength={max}
              placeholder={placeholder}
              variant="secondary"
            />
            <FieldError>{errors[name]}</FieldError>
          </TextField>
        ))}
        <TextField isReadOnly value={user.correo} variant="secondary">
          <Label>Correo electrónico</Label>
          <Input variant="secondary" />
          <p className="text-xs text-muted">Puedes cambiarlo desde la pestaña Seguridad.</p>
        </TextField>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 sm:col-span-2">
          <p className="text-xs text-muted" role="status">
            {dirty ? "Tienes cambios sin guardar." : "Tus datos están actualizados."}
          </p>
          <div className="flex gap-2">
            <Button
              isDisabled={!dirty || saving}
              type="button"
              variant="secondary"
              onPress={() => {
                setValues(baseline);
                setTouched({});
              }}
            >
              Cancelar
            </Button>
            <Button isDisabled={!dirty || !valid || saving} type="submit" variant="primary">
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </Form>
      <p className="text-xs text-muted">
        El rol, cargo y empresa se gestionan desde administración.
      </p>
    </section>
  );
}
