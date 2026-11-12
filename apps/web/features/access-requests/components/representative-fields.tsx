"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { AccessTextField } from "./text-field-input";
import { FormSection } from "./form-section";

type Props = {
  register: UseFormRegister<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
};

export function RepresentativeFields({ register, errors }: Props) {
  return (
    <FormSection
      description="Utilizaremos esta información para atender la solicitud empresarial."
      step="02 / Representante"
      title="Persona de contacto"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <AccessTextField
          autoComplete="given-name"
          errors={errors}
          label="Nombres"
          maxLength={100}
          name="nombre"
          placeholder="Nombres"
          register={register}
        />
        <AccessTextField
          autoComplete="family-name"
          errors={errors}
          label="Apellidos"
          maxLength={100}
          name="apellido"
          placeholder="Apellidos"
          register={register}
        />
        <AccessTextField
          autoComplete="email"
          errors={errors}
          label="Correo electrónico"
          maxLength={255}
          name="correo"
          placeholder="nombre@empresa.com"
          prefix="email"
          register={register}
          type="email"
        />
        <AccessTextField
          errors={errors}
          inputMode="tel"
          label="Teléfono"
          maxLength={30}
          name="telefono"
          placeholder="+51 987 654 321"
          prefix="phone"
          register={register}
          type="tel"
        />
      </div>
    </FormSection>
  );
}
