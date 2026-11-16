"use client";

import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { FieldError, Input, InputGroup, Label, TextField } from "@heroui/react";
import { FiAtSign, FiHash, FiPhone } from "react-icons/fi";

import { fieldSurface, fieldSurfaceInvalid } from "./field-styles";

type FieldName = Exclude<keyof AccessFormValues, "consentimiento" | "tipo_empresa" | "uso">;

type Props = {
  name: FieldName;
  label: string;
  placeholder: string;
  register: UseFormRegister<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
  inputMode?: "numeric" | "tel";
  prefix?: "ruc" | "email" | "phone";
  onValueChange?: () => void;
  /** Elemento a la derecha del campo (por ejemplo un botón). Queda alineado al borde superior del input. */
  action?: ReactNode;
};

const prefixIcons = {
  ruc: FiHash,
  email: FiAtSign,
  phone: FiPhone,
};

export function AccessTextField({
  name,
  label,
  placeholder,
  register,
  errors,
  type = "text",
  autoComplete,
  maxLength,
  inputMode,
  prefix,
  onValueChange,
  action,
}: Props) {
  const error = errors[name]?.message;
  const surface = error ? fieldSurfaceInvalid : fieldSurface;
  const inputProps = {
    id: name,
    placeholder,
    type,
    autoComplete,
    maxLength,
    inputMode,
    ...register(name, { onChange: onValueChange }),
  };
  const PrefixIcon = prefix ? prefixIcons[prefix] : null;

  return (
    <TextField className="min-w-0" isInvalid={Boolean(error)} name={name}>
      <Label className="text-sm font-medium text-foreground">{label} *</Label>
      {/* El botón (si existe) comparte fila con el input; el mensaje de error queda solo bajo el input */}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          {PrefixIcon ? (
            <InputGroup className={`min-h-11 w-full ${surface}`}>
              <InputGroup.Prefix aria-hidden="true" className="text-muted">
                <PrefixIcon className="size-4" />
              </InputGroup.Prefix>
              <InputGroup.Input {...inputProps} />
            </InputGroup>
          ) : (
            <Input {...inputProps} className={`min-h-11 w-full ${surface}`} />
          )}
          <FieldError>{error ? String(error) : undefined}</FieldError>
        </div>
        {action}
      </div>
    </TextField>
  );
}
