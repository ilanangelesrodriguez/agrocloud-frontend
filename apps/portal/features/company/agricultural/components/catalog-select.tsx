"use client";

import { Label, ListBox, Select, FieldError } from "@heroui/react";

export function CatalogSelect({
  label,
  name,
  value,
  onChange,
  items,
  optional = false,
  disabled = false,
  emptyLabel = "Todos los productos",
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  items: { id: string; name: string }[];
  optional?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
}) {
  return (
    <Select
      name={name}
      variant="secondary"
      isRequired={!optional}
      isDisabled={disabled}
      value={value || (optional ? "__all" : null)}
      onChange={(key) => onChange(typeof key === "string" && key !== "__all" ? key : "")}
      placeholder="Selecciona una opción"
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox aria-label={label}>
          {optional ? (
            <ListBox.Item id="__all" textValue={emptyLabel}>
              {emptyLabel}
            </ListBox.Item>
          ) : null}
          {Array.from(new Map(items.map((item) => [item.id, item])).values()).map((item) => (
            <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
              {item.name}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
      <FieldError />
    </Select>
  );
}
