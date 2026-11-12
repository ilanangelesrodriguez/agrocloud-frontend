"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import NextLink from "next/link";
import { Checkbox, Description, FieldError, Label, TextArea, TextField } from "@heroui/react";
import { Controller } from "react-hook-form";

import { FormSection } from "./form-section";

type Props = {
  register: UseFormRegister<AccessFormValues>;
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  privacyVersion: string;
};

export function OperationFields({ register, control, errors, privacyVersion }: Props) {
  return (
    <FormSection
      description="Describe cómo planeas utilizar AgroCloud."
      step="03 / Necesidades"
      title="Tu operación agrícola"
    >
      <TextField isInvalid={Boolean(errors.uso)}>
        <Label>¿Cómo planeas utilizar AgroCloud? *</Label>
        <TextArea
          {...register("uso")}
          className="min-h-32 w-full resize-y"
          maxLength={4000}
          placeholder="Por ejemplo: necesitamos registrar recepciones de palta, realizar muestreos e inspecciones y consultar dictámenes."
          rows={5}
        />
        <Description>Entre 20 y 4 000 caracteres.</Description>
        <FieldError>{errors.uso?.message}</FieldError>
      </TextField>
      <Controller
        control={control}
        name="consentimiento"
        render={({ field }) => (
          <Checkbox
            isRequired
            className="mt-6 rounded-xl border border-border bg-background p-4"
            isInvalid={Boolean(errors.consentimiento)}
            isSelected={field.value}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Checkbox.Content className="items-start gap-3">
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <span className="text-sm leading-6">
                He leído la información de privacidad y autorizo utilizar mis datos para revisar
                esta solicitud.
              </span>
            </Checkbox.Content>
            <Description className="mt-2">
              Consulta la{" "}
              <NextLink className="text-accent underline underline-offset-2" href="/privacidad">
                política de privacidad
              </NextLink>{" "}
              (versión {privacyVersion}) antes de enviar la información.
            </Description>
            <FieldError>{errors.consentimiento?.message}</FieldError>
          </Checkbox>
        )}
      />
    </FormSection>
  );
}
