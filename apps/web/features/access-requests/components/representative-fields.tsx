"use client";

import type { Control, FieldErrors } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { AccessTextField } from "./text-field-input";
import { FormSection } from "./form-section";

type Props = {
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
};

export function RepresentativeFields({ control, errors }: Props) {
  return (
    <FormSection
      description="Utilizaremos esta información para atender la solicitud empresarial."
      step="02 / Representante"
      title="Persona de contacto"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <AccessTextField
          autoComplete="given-name"
          control={control}
          errors={errors}
          label="Nombres"
          maxLength={100}
          name="nombre"
          placeholder="Nombres"
        />
        <AccessTextField
          autoComplete="family-name"
          control={control}
          errors={errors}
          label="Apellidos"
          maxLength={100}
          name="apellido"
          placeholder="Apellidos"
        />
        <AccessTextField
          autoComplete="email"
          control={control}
          errors={errors}
          label="Correo electrónico"
          maxLength={255}
          name="correo"
          placeholder="nombre@empresa.com"
          prefix="email"
          type="email"
        />
        <AccessTextField
          control={control}
          errors={errors}
          inputMode="tel"
          label="Teléfono"
          maxLength={30}
          name="telefono"
          placeholder="+51 987 654 321"
          prefix="phone"
          type="tel"
        />
      </div>
    </FormSection>
  );
}
