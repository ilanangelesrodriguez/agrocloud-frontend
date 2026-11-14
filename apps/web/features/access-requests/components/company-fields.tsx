"use client";

import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { AccessTextField } from "./text-field-input";
import { CompanyTypeField } from "./company-type-field";
import { FormSection } from "./form-section";
import { RucLookupField } from "./ruc-lookup-field";

type Props = {
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  getValues: UseFormGetValues<AccessFormValues>;
  register: UseFormRegister<AccessFormValues>;
  setValue: UseFormSetValue<AccessFormValues>;
};

export function CompanyFields({ control, errors, getValues, register, setValue }: Props) {
  return (
    <FormSection
      description="Completa los datos legales de la empresa."
      step="01 / Empresa"
      title="Información de la organización"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <RucLookupField
          errors={errors}
          getValues={getValues}
          register={register}
          setValue={setValue}
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
    </FormSection>
  );
}
