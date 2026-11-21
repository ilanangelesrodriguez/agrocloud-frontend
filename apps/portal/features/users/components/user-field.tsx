"use client";
import { fieldPlaceholder } from "@/lib/form-fields";

import { TextField, Label, Input, FieldError } from "@heroui/react";

export function UserField({
  name,
  label,
  maxLength,
  required = false,
  type = "text",
  initial,
}: {
  name: string;
  label: string;
  maxLength: number;
  required?: boolean;
  type?: "text" | "email" | "tel";
  initial?: string | null;
}) {
  return (
    <TextField
      variant="secondary"
      defaultValue={initial ?? ""}
      isRequired={required}
      name={name}
      type={type}
    >
      <Label>{label}</Label>
      <Input
        placeholder={fieldPlaceholder(name, label)}
        variant="secondary"
        className="w-full"
        maxLength={maxLength}
      />
      <FieldError />
    </TextField>
  );
}
