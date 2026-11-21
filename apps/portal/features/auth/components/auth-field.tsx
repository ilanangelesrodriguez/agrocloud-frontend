"use client";

import type { ComponentProps } from "react";

import { useState } from "react";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type Props = Omit<ComponentProps<typeof Input>, "children"> & {
  label: string;
  error?: string;
  passwordToggle?: boolean;
};

export function AuthField({ label, error, passwordToggle = false, type, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  const realType = passwordToggle ? (visible ? "text" : "password") : type;

  return (
    <TextField variant="secondary" className="w-full" isInvalid={Boolean(error)}>
      <Label className="mb-1.5 text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          placeholder={String(label)}
          variant="secondary"
          {...inputProps}
          className="min-h-12 w-full pr-12"
          type={realType}
        />
        {passwordToggle && (
          <Button
            isIconOnly
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
            size="sm"
            type="button"
            variant="tertiary"
            onPress={() => setVisible(!visible)}
          >
            {visible ? <FiEyeOff /> : <FiEye />}
          </Button>
        )}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </TextField>
  );
}
