"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, TextField, toast, FieldError, Form } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { postAuth } from "../request";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function PasswordEditor() {
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });
  const [values, setValues] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const cache = useQueryClient();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const { current_password, password, password_confirmation } = values;
    if (password !== password_confirmation) {
      setFieldErrors({ password_confirmation: "Las contraseñas no coinciden." });
      return;
    }
    setFieldErrors({});
    setBusy(true);
    try {
      await postAuth("/api/auth/change-password", {
        current_password,
        password,
        password_confirmation,
      });
      cache.clear();
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudo cambiar la contraseña.");
      setBusy(false);
    }
  }
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
      <p className="text-sm text-muted">
        Usa tu contraseña actual. Se cerrarán las demás sesiones.
      </p>
      <Form
        validationErrors={fieldErrors}
        validationBehavior="native"
        className="grid gap-4"
        onSubmit={(event) => void submit(event)}
      >
        <TextField
          variant="secondary"
          name="current_password"
          type={visible.current_password ? "text" : "password"}
          isRequired
          isDisabled={busy}
          value={values.current_password}
          onChange={(value) => {
            setValues((previous) => ({ ...previous, current_password: value }));
            setFieldErrors((previous) => (Object.keys(previous).length ? {} : previous));
          }}
        >
          <Label>Contraseña actual</Label>
          <div className="relative">
            <Input
              placeholder="Introduce tu contraseña actual"
              variant="secondary"
              className="w-full pr-12"
              type={visible.current_password ? "text" : "password"}
              autoComplete="current-password"
            />
            <Button
              type="button"
              isIconOnly
              size="sm"
              variant="tertiary"
              isDisabled={busy}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              aria-label={
                (visible.current_password ? "Ocultar " : "Mostrar ") + "contraseña actual"
              }
              aria-pressed={visible.current_password}
              onPress={() =>
                setVisible((previous) => ({
                  ...previous,
                  current_password: !previous.current_password,
                }))
              }
            >
              {visible.current_password ? (
                <FiEyeOff aria-hidden="true" />
              ) : (
                <FiEye aria-hidden="true" />
              )}
            </Button>
          </div>
          <FieldError />
        </TextField>
        <TextField
          variant="secondary"
          name="password"
          type={visible.password ? "text" : "password"}
          isRequired
          isDisabled={busy}
          value={values.password}
          onChange={(value) => {
            setValues((previous) => ({ ...previous, password: value }));
            setFieldErrors((previous) => (Object.keys(previous).length ? {} : previous));
          }}
        >
          <Label>Nueva contraseña</Label>
          <div className="relative">
            <Input
              placeholder="Introduce una contraseña segura"
              variant="secondary"
              className="w-full pr-12"
              type={visible.password ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
            />
            <Button
              type="button"
              isIconOnly
              size="sm"
              variant="tertiary"
              isDisabled={busy}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              aria-label={(visible.password ? "Ocultar " : "Mostrar ") + "nueva contraseña"}
              aria-pressed={visible.password}
              onPress={() =>
                setVisible((previous) => ({ ...previous, password: !previous.password }))
              }
            >
              {visible.password ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
            </Button>
          </div>
          <FieldError />
        </TextField>
        <TextField
          variant="secondary"
          name="password_confirmation"
          type={visible.password_confirmation ? "text" : "password"}
          isRequired
          isDisabled={busy}
          value={values.password_confirmation}
          onChange={(value) => {
            setValues((previous) => ({ ...previous, password_confirmation: value }));
            setFieldErrors((previous) => (Object.keys(previous).length ? {} : previous));
          }}
        >
          <Label>Confirma la nueva contraseña</Label>
          <div className="relative">
            <Input
              placeholder="Repite la nueva contraseña"
              variant="secondary"
              className="w-full pr-12"
              type={visible.password_confirmation ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
            />
            <Button
              type="button"
              isIconOnly
              size="sm"
              variant="tertiary"
              isDisabled={busy}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              aria-label={
                (visible.password_confirmation ? "Ocultar " : "Mostrar ") +
                "confirmación de contraseña"
              }
              aria-pressed={visible.password_confirmation}
              onPress={() =>
                setVisible((previous) => ({
                  ...previous,
                  password_confirmation: !previous.password_confirmation,
                }))
              }
            >
              {visible.password_confirmation ? (
                <FiEyeOff aria-hidden="true" />
              ) : (
                <FiEye aria-hidden="true" />
              )}
            </Button>
          </div>
          <FieldError />
        </TextField>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" isDisabled={busy}>
            {busy ? "Actualizando…" : "Cambiar contraseña"}
          </Button>
        </div>
      </Form>
    </section>
  );
}
