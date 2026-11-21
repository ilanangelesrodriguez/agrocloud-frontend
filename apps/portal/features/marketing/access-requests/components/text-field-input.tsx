"use client";

import type { ChangeEvent, ReactNode } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { Description, FieldError, Input, InputGroup, Label, TextField } from "@heroui/react";
import { Controller } from "react-hook-form";
import { FiAtSign, FiHash, FiPhone } from "react-icons/fi";

import { fieldSurface, fieldSurfaceInvalid } from "./field-styles";

type FieldName = Exclude<keyof AccessFormValues, "consentimiento" | "tipo_empresa" | "uso">;

type Props = {
  name: FieldName;
  label: string;
  placeholder: string;
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
  inputMode?: "numeric" | "tel";
  prefix?: "ruc" | "email" | "phone";
  description?: string;
  onValueChange?: () => void;
  /** Acción junto al campo, por ejemplo el botón para consultar RUC. */
  action?: ReactNode;
};

const prefixIcons = {
  ruc: FiHash,
  email: FiAtSign,
  phone: FiPhone,
};

export function AccessTextField({
  name,
  label,
  placeholder,
  control,
  errors,
  type = "text",
  autoComplete,
  maxLength,
  inputMode,
  prefix,
  description,
  onValueChange,
  action,
}: Props) {
  const error = errors[name]?.message;
  const surface = error ? fieldSurfaceInvalid : fieldSurface;
  const PrefixIcon = prefix ? prefixIcons[prefix] : null;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        // Controlar explícitamente value garantiza que setValue() actualice
        // los inputs de HeroUI, incluidos los que reciben datos de SUNAT.
        const inputProps = {
          id: name,
          name: field.name,
          placeholder,
          type,
          autoComplete,
          maxLength,
          inputMode,
          value: field.value ?? "",
          ref: field.ref,
          onBlur: field.onBlur,
          onChange: (event: ChangeEvent<HTMLInputElement>) => {
            field.onChange(event);
            onValueChange?.();
          },
        };

        return (
          <TextField variant="secondary" className="min-w-0" isInvalid={Boolean(error)} name={name}>
            <Label className="text-sm font-medium text-foreground">{label} *</Label>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                {PrefixIcon ? (
                  <InputGroup variant="secondary" className={`min-h-11 w-full ${surface}`}>
                    <InputGroup.Prefix aria-hidden="true" className="text-muted">
                      <PrefixIcon className="size-4" />
                    </InputGroup.Prefix>
                    <InputGroup.Input {...inputProps} />
                  </InputGroup>
                ) : (
                  <Input
                    variant="secondary"
                    {...inputProps}
                    className={`min-h-11 w-full ${surface}`}
                  />
                )}
              </div>
              {action}
            </div>
            {description ? <Description className="mt-1 text-xs">{description}</Description> : null}
            <FieldError>{error ? String(error) : undefined}</FieldError>
          </TextField>
        );
      }}
    />
  );
}
