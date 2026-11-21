"use client";

import { Input, Label, TextField } from "@heroui/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function HoneypotField({ value, onChange }: Props) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <TextField variant="secondary">
        <Label>Sitio web (no completar)</Label>
        <Input
          variant="secondary"
          autoComplete="off"
          name="website"
          tabIndex={-1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </TextField>
    </div>
  );
}
