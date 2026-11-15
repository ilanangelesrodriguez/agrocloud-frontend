"use client";

import type { Control, FieldErrors } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { FieldError, Label, ListBox, Select } from "@heroui/react";
import { Controller } from "react-hook-form";

import { companyTypes } from "../schema";

import { fieldSurface, fieldSurfaceInvalid } from "./field-styles";

type Props = {
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
};

export function CompanyTypeField({ control, errors }: Props) {
  return (
    <Controller
      control={control}
      name="tipo_empresa"
      render={({ field }) => (
        <Select
          isInvalid={Boolean(errors.tipo_empresa)}
          name={field.name}
          placeholder="Selecciona la actividad"
          value={field.value || null}
          onBlur={field.onBlur}
          onChange={(value) => field.onChange(value == null ? "" : String(value))}
        >
          <Label className="text-sm font-medium text-foreground">Tipo de empresa *</Label>
          <Select.Trigger
            className={`min-h-11 w-full ${errors.tipo_empresa ? fieldSurfaceInvalid : fieldSurface}`}
          >
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <FieldError>{errors.tipo_empresa?.message}</FieldError>
          <Select.Popover className="border border-brand-600/20 shadow-xl shadow-brand-700/10">
            <ListBox aria-label="Tipos de empresa">
              {companyTypes.map((type) => (
                <ListBox.Item key={type} id={type} textValue={type}>
                  <Label>{type}</Label>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      )}
    />
  );
}
