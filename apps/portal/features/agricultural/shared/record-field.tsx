"use client";

import { TextField, Label, Input, FieldError } from "@heroui/react";

export function RecordField({
  name,
  label,
  initial,
  required,
  type = "text",
  maxLength,
  step,
  error,
}: {
  name: string;
  label: string;
  initial?: string | null;
  required?: boolean;
  type?: "text" | "number" | "datetime-local";
  maxLength?: number;
  step?: string;
  error?: string;
}) {
  return (
    <TextField
      defaultValue={initial ?? ""}
      isRequired={required}
      isInvalid={Boolean(error)}
      name={name}
      type={type}
    >
      <Label>{label}</Label>
      <Input className="w-full" maxLength={maxLength} step={step} />
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
