"use client";

import { DateInput } from "@/components/date-input";

import { Input, Label, TextField } from "@heroui/react";

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
    <TextField defaultValue={String(initial ?? "")} isRequired={required} name={name} type={type}>
      <Label>{label}</Label>
      <Input className="w-full" step={step} />
    </TextField>
  );
}
