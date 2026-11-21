"use client";

import { DateInput } from "@/components/date-input";

import { Input, Label, TextField, FieldError } from "@heroui/react";

export function OfferField({
  label,
  name,
  initial,
  type = "text",
  required,
  step,
}: {
  label: string;
  name: string;
  initial?: string | number;
  type?: "text" | "number" | "date";
  required?: boolean;
  step?: string;
}) {
  if (type === "date") {
    return (
      <DateInput
        initial={initial == null ? undefined : String(initial)}
        label={label}
        name={name}
        required={required}
      />
    );
  }

  return (
    <TextField
      variant="secondary"
      defaultValue={String(initial ?? "")}
      isRequired={required}
      name={name}
      type={type}
    >
      <Label>{label}</Label>
      <Input placeholder={String(label)} variant="secondary" className="w-full" step={step} />
      <FieldError />
    </TextField>
  );
}
