"use client";

import type { Control, FieldErrors, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { AccessTextField } from "./text-field-input";
import { CompanyTypeField } from "./company-type-field";
import { FormSection } from "./form-section";
import { RucLookupField } from "./ruc-lookup-field";

type Props = {
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  getValues: UseFormGetValues<AccessFormValues>;
  setValue: UseFormSetValue<AccessFormValues>;
};

export function CompanyFields({ control, errors, getValues, setValue }: Props) {
  return (
    <FormSection
      description="Consulta el RUC para completar los datos disponibles y revisa la información antes de continuar."
      step="01 / Empresa"
      title="Información de la organización"
    >
      <div className="grid items-start gap-x-5 gap-y-5 sm:grid-cols-2">
        <RucLookupField
          control={control}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
        />
        <AccessTextField
          control={control}
          description="Se completa al verificar el RUC; también puedes corregirla."
          errors={errors}
          label="Razón social"
          maxLength={200}
          name="razon_social"
          placeholder="Razón social registrada"
        />
        <AccessTextField
          autoComplete="organization"
          control={control}
          description="Si no tienes uno distinto, utiliza tu razón social."
          errors={errors}
          label="Nombre comercial"
          maxLength={150}
          name="nombre_comercial"
          placeholder="Nombre con el que opera tu empresa"
        />
        <CompanyTypeField control={control} errors={errors} />
      </div>
    </FormSection>
  );
}
