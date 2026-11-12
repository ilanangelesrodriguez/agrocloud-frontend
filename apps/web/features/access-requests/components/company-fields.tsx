"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { Alert } from "@heroui/react";

import { AccessTextField } from "./text-field-input";
import { CompanyTypeField } from "./company-type-field";
import { FormSection } from "./form-section";

type Props = {
  register: UseFormRegister<AccessFormValues>;
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
};

export function CompanyFields({ register, control, errors }: Props) {
  return (
    <FormSection
      description="Completa los datos legales de la empresa."
      step="01 / Empresa"
      title="Información de la organización"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <AccessTextField
          errors={errors}
          inputMode="numeric"
          label="RUC"
          maxLength={11}
          name="ruc"
          placeholder="11 dígitos"
          prefix="ruc"
          register={register}
        />
        <AccessTextField
          autoComplete="organization"
          errors={errors}
          label="Nombre comercial"
          maxLength={150}
          name="nombre_comercial"
          placeholder="Nombre de la empresa"
          register={register}
        />
        <div className="sm:col-span-2">
          <AccessTextField
            errors={errors}
            label="Razón social"
            maxLength={200}
            name="razon_social"
            placeholder="Razón social registrada"
            register={register}
          />
        </div>
        <div className="sm:col-span-2">
          <CompanyTypeField control={control} errors={errors} />
        </div>
      </div>
      <Alert className="mt-5" status="default">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Consulta automática de RUC pendiente</Alert.Title>
          <Alert.Description>
            El backend tiene una integración con un proveedor del padrón SUNAT, pero no ofrece
            actualmente una ruta pública autorizada para usarla desde esta web. Puedes registrar la
            información manualmente.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </FormSection>
  );
}
