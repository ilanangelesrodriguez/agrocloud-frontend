"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { FieldError, Input, InputGroup, Label, TextField } from "@heroui/react";
import { FiAtSign, FiHash, FiPhone } from "react-icons/fi";

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
}: Props) {
  const error = errors[name]?.message;
  const inputProps = {
    id: name,
    placeholder,
    type,
    autoComplete,
    maxLength,
    inputMode,
    ...register(name),
  };
  const PrefixIcon = prefix ? prefixIcons[prefix] : null;

  return (
    <TextField className="min-w-0 space-y-1.5" isInvalid={Boolean(error)} name={name}>
      <Label className="text-sm font-medium text-foreground">{label} *</Label>
      {PrefixIcon ? (
        <InputGroup className="min-h-11 w-full">
          <InputGroup.Prefix aria-hidden="true" className="text-muted">
            <PrefixIcon className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input {...inputProps} />
        </InputGroup>
      ) : (
        <Input {...inputProps} className="min-h-11 w-full" />
      )}
      <FieldError>{error ? String(error) : undefined}</FieldError>
    </TextField>
  );
}
