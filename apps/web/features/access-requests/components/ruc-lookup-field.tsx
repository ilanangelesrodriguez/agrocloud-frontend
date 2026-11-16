"use client";

import type {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { useRef, useState } from "react";
import { Button, Typography } from "@heroui/react";
import { FiSearch } from "react-icons/fi";

import { useRucLookup } from "@/features/ruc/hooks/use-ruc-lookup";
import { rucSchema } from "@/features/ruc/schema";

import { AccessTextField } from "./text-field-input";

type Props = {
  errors: FieldErrors<AccessFormValues>;
  getValues: UseFormGetValues<AccessFormValues>;
  register: UseFormRegister<AccessFormValues>;
  setValue: UseFormSetValue<AccessFormValues>;
};

export function RucLookupField({ errors, getValues, register, setValue }: Props) {
  const lookup = useRucLookup();
  const [feedback, setFeedback] = useState("");
  const lookupRevision = useRef(0);
  const filledName = useRef<string | null>(null);

  function onRucChange() {
    lookupRevision.current += 1;
    setFeedback("");

    if (filledName.current !== null && getValues("razon_social") === filledName.current) {
      setValue("razon_social", "", {
        shouldDirty: true,
        shouldValidate: Boolean(errors.razon_social),
      });
    }

    filledName.current = null;
  }

  async function consultRuc() {
    const parsed = rucSchema.safeParse(getValues("ruc"));

    if (!parsed.success) {
      setFeedback("Ingresa los 11 dígitos del RUC para consultar.");
      return;
    }

    const revision = ++lookupRevision.current;
    const previousName = getValues("razon_social");

    setFeedback("");

    try {
      const result = await lookup.mutateAsync(parsed.data);

      if (revision !== lookupRevision.current || getValues("ruc") !== parsed.data) return;

      const name = result.razon_social?.trim();

      if (result.resultado === "verificado" && name && name.length >= 3 && name.length <= 200) {
        if (getValues("razon_social") === previousName) {
          setValue("razon_social", name, { shouldDirty: true, shouldValidate: true });
          filledName.current = name;
        }

        setFeedback(`Razón social encontrada: ${name}. Revisa el dato antes de enviar.`);
      } else if (result.resultado === "no_encontrado") {
        setFeedback("El proveedor no encontró el RUC. Revísalo o completa los datos manualmente.");
      } else {
        setFeedback("No fue posible verificar el RUC. Puedes completar los datos manualmente.");
      }
    } catch (error) {
      if (revision !== lookupRevision.current) return;

      const message = error instanceof Error ? error.message : "No se pudo consultar el RUC.";

      setFeedback(`${message} Puedes completar los datos manualmente.`);
    }
  }

  return (
    <div className="min-w-0">
      <AccessTextField
        action={
          // h-11 = misma altura que el input (min-h-11), así quedan a ras
          <Button
            className="h-11 shrink-0"
            isDisabled={lookup.isPending}
            isPending={lookup.isPending}
            type="button"
            variant="secondary"
            onPress={() => void consultRuc()}
          >
            <FiSearch aria-hidden="true" className="size-4" />
            {lookup.isPending ? "Consultando…" : "Consultar"}
          </Button>
        }
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
      <div aria-live="polite" role="status">
        {feedback ? (
          <Typography.Paragraph className="mt-2 text-sm leading-6 text-muted">
            {feedback}
          </Typography.Paragraph>
        ) : null}
      </div>
    </div>
  );
}
