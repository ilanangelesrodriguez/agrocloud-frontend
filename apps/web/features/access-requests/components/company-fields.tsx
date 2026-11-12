"use client";

import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { useRef, useState } from "react";
import { Button } from "@heroui/react";

import { useRucLookup } from "@/features/ruc/hooks/use-ruc-lookup";
import { rucSchema } from "@/features/ruc/schema";

import { AccessTextField } from "./text-field-input";
import { CompanyTypeField } from "./company-type-field";
import { FormSection } from "./form-section";

type Props = {
  register: UseFormRegister<AccessFormValues>;
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  getValues: UseFormGetValues<AccessFormValues>;
  setValue: UseFormSetValue<AccessFormValues>;
};

export function CompanyFields({ register, control, errors, getValues, setValue }: Props) {
  const lookup = useRucLookup();
  const [feedback, setFeedback] = useState("");
  const lookupRevision = useRef(0);
  const filledName = useRef<string | null>(null);

  function onRucChange() {
    lookupRevision.current++;
    setFeedback("");

    if (filledName.current !== null && getValues("razon_social") === filledName.current) {
      setValue("razon_social", "", { shouldDirty: true, shouldValidate: Boolean(errors.razon_social) });
    }
    filledName.current = null;
  }

  async function consultRuc() {
    const ruc = rucSchema.safeParse(getValues("ruc"));
    if (!ruc.success) {
      setFeedback("Ingresa los 11 dígitos del RUC para consultar.");
      return;
    }

    const revision = ++lookupRevision.current;
    const previousName = getValues("razon_social");
    setFeedback("");

    try {
      const result = await lookup.mutateAsync(ruc.data);
      if (revision !== lookupRevision.current) return;

      const name = result.razon_social?.trim();
      if (result.resultado === "verificado" && name && name.length >= 3 && name.length <= 200) {
        if (getValues("razon_social") === previousName) {
          setValue("razon_social", name, { shouldDirty: true, shouldValidate: true });
          filledName.current = name;
        }
        setFeedback("Razón social registrada: " + name + ". Revisa el dato antes de enviar.");
      } else {
        setFeedback(
          result.resultado === "no_encontrado"
            ? "El proveedor no encontró el RUC. Verifícalo o completa los datos manualmente."
            : "No se pudo verificar el RUC. Puedes completar los datos manualmente.",
        );
      }
    } catch (error) {
      if (revision !== lookupRevision.current) return;
      const message = error instanceof Error ? error.message : "No se pudo consultar el RUC.";
      setFeedback(message + " Puedes completar los datos manualmente.");
    }
  }

  return (
    <FormSection
      description="Completa los datos legales de la empresa."
      step="01 / Empresa"
      title="Información de la organización"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-36 flex-1">
              <AccessTextField
                errors={errors}
                inputMode="numeric"
                label="RUC"
                maxLength={11}
                name="ruc"
                placeholder="11 dígitos"
                prefix="ruc"
                register={register}
                onValueChange={onRucChange}
              />
            </div>
            <Button
              className="mt-6 min-h-11"
              isDisabled={lookup.isPending}
              type="button"
              variant="secondary"
              onPress={consultRuc}
            >
              {lookup.isPending ? "Consultando…" : "Consultar"}
            </Button>
          </div>
          <p className="text-sm text-muted" role="status">
            {feedback}
          </p>
        </div>
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
