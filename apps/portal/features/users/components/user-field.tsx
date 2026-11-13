"use client";

import { TextField, Label, Input } from "@heroui/react";

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
    <TextField defaultValue={initial ?? ""} isRequired={required} name={name} type={type}>
      <Label>{label}</Label>
      <Input className="w-full" maxLength={maxLength} />
    </TextField>
  );
}
