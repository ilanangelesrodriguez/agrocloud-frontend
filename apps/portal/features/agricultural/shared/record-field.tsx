"use client";

import { TextField, Label, Input } from "@heroui/react";

export function RecordField({
  name,
  label,
  initial,
  required,
  type = "text",
  maxLength,
  step,
}: {
  name: string;
  label: string;
  initial?: string | null;
  required?: boolean;
  type?: "text" | "number" | "datetime-local";
  maxLength?: number;
  step?: string;
}) {
  return (
    <TextField defaultValue={initial ?? ""} isRequired={required} name={name} type={type}>
      <Label>{label}</Label>
      <Input className="w-full" maxLength={maxLength} step={step} />
    </TextField>
  );
}
