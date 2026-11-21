"use client";
import { fieldPlaceholder } from "@/lib/form-fields";

import { DateInput } from "@/components/date-input";

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
  if (type === "datetime-local") {
    return (
      <DateInput
        withTime
        error={error}
        initial={initial}
        label={label}
        name={name}
        required={required}
      />
    );
  }

  return (
    <TextField
      variant="secondary"
      defaultValue={initial ?? ""}
      isRequired={required}
      isInvalid={error ? true : undefined}
      name={name}
      type={type}
    >
      <Label>{label}</Label>
      <Input
        placeholder={fieldPlaceholder(name, label)}
        variant="secondary"
        className="w-full"
        maxLength={maxLength}
        step={step}
      />
      <FieldError>{error}</FieldError>
    </TextField>
  );
}
