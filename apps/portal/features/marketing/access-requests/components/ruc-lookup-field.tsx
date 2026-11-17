"use client";

import type { Control, FieldErrors, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import type { AccessFormValues } from "../schema";

import { useRef, useState } from "react";
import { Button, Typography } from "@heroui/react";
import { FiAlertCircle, FiCheckCircle, FiSearch } from "react-icons/fi";

import { AccessTextField } from "./text-field-input";

import { useRucLookup } from "@/features/marketing/ruc/hooks/use-ruc-lookup";
import { rucSchema } from "@/features/marketing/ruc/schema";

type Props = {
  control: Control<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  getValues: UseFormGetValues<AccessFormValues>;
  setValue: UseFormSetValue<AccessFormValues>;
};

type LookupFeedback = { tone: "success" | "warning"; message: string };

export function RucLookupField({ control, errors, getValues, setValue }: Props) {
  const lookup = useRucLookup();
  const [feedback, setFeedback] = useState<LookupFeedback | null>(null);
  const lookupRevision = useRef(0);
  const filledName = useRef<string | null>(null);

  function onRucChange() {
    // Invalida los resultados de consultas anteriores al modificar el RUC.
    lookupRevision.current += 1;
    setFeedback(null);

    // Solo elimina la razón social que el sistema había rellenado y que
    // el usuario no modificó. Nunca borra una corrección manual.
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
      setFeedback({ tone: "warning", message: "Ingresa exactamente 11 dígitos para consultar." });

      return;
    }

    const revision = ++lookupRevision.current;
    const previousName = getValues("razon_social");

    setFeedback(null);

    try {
      const result = await lookup.mutateAsync(parsed.data);

      // No aplicar datos de una respuesta antigua sobre un RUC recién escrito.
      if (revision !== lookupRevision.current || getValues("ruc") !== parsed.data) return;

      const name = result.razon_social?.trim();

      if (result.resultado === "verificado" && name && name.length >= 3 && name.length <= 200) {
        if (getValues("razon_social") === previousName) {
          setValue("razon_social", name, { shouldDirty: true, shouldValidate: true });
          filledName.current = name;
          setFeedback({
            tone: "success",
            message: "RUC verificado. La razón social se completó automáticamente.",
          });
        } else {
          setFeedback({
            tone: "success",
            message: "RUC verificado. Conservamos la razón social que escribiste; revísala.",
          });
        }
      } else if (result.resultado === "no_encontrado") {
        setFeedback({
          tone: "warning",
          message: "No encontramos ese RUC. Revísalo o completa los datos manualmente.",
        });
      } else {
        setFeedback({
          tone: "warning",
          message: "No fue posible verificar el RUC. Puedes completar los datos manualmente.",
        });
      }
    } catch (error) {
      if (revision !== lookupRevision.current) return;
      const message = error instanceof Error ? error.message : "No se pudo consultar el RUC.";

      setFeedback({
        tone: "warning",
        message: `${message} Puedes completar los datos manualmente.`,
      });
    }
  }

  const isVerified = feedback?.tone === "success";

  return (
    <div className="min-w-0 space-y-2">
      <AccessTextField
        action={
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
        control={control}
        errors={errors}
        inputMode="numeric"
        label="RUC"
        maxLength={11}
        name="ruc"
        placeholder="11 dígitos"
        prefix="ruc"
        onValueChange={onRucChange}
      />
      <div aria-live="polite" role="status">
        {feedback ? (
          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
              isVerified
                ? "bg-brand-600/10 text-brand-700 dark:text-brand-400"
                : "bg-warning/10 text-foreground"
            }`}
          >
            {isVerified ? (
              <FiCheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            ) : (
              <FiAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            )}
            <Typography.Paragraph className="text-xs leading-5">
              {feedback.message}
            </Typography.Paragraph>
          </div>
        ) : null}
      </div>
    </div>
  );
}
