"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react";
import { FormNotice } from "@agrocloud/ui";

import { DemoLabel, DemoSection } from "./demo-section";

const sampleSchema = z.object({
  codigo: z.string().trim().min(3, "Escribe al menos 3 caracteres."),
  responsable: z.string().trim().min(2, "Indica el responsable."),
});

type SampleValues = z.infer<typeof sampleSchema>;

/** Ejemplo autocontenido: RHF + Zod + HeroUI, sin ninguna petición HTTP. */
export function FormPatternDemo() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SampleValues>({
    resolver: zodResolver(sampleSchema),
    defaultValues: { codigo: "", responsable: "" },
  });

  const submit = handleSubmit(() => {
    toast.success("Formulario de ejemplo validado", {
      description: "No se creó ningún registro real.",
    });
    reset();
  });

  return (
    <DemoSection
      description="Patrón recomendado para formularios sencillos: HeroUI TextField, React Hook Form y validación Zod."
      title="Formulario tipado y validado"
    >
      <DemoLabel>Ejemplo de uso con campos registrados</DemoLabel>
      <Form className="grid gap-4" validationBehavior="aria" onSubmit={submit}>
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <TextField className="w-full" isInvalid={Boolean(errors.codigo)}>
            <Label>Código de prueba</Label>
            <Input placeholder="LOTE-001" {...register("codigo")} />
            {errors.codigo ? <FieldError>{errors.codigo.message}</FieldError> : null}
          </TextField>
          <TextField className="w-full" isInvalid={Boolean(errors.responsable)}>
            <Label>Responsable</Label>
            <Input placeholder="Nombre de ejemplo" {...register("responsable")} />
            {errors.responsable ? <FieldError>{errors.responsable.message}</FieldError> : null}
          </TextField>
        </div>
        <FormNotice message="Esta vista es una demostración sin persistencia." success />
        <div className="flex gap-3">
          <Button isDisabled={isSubmitting} type="submit" variant="primary">
            Validar ejemplo
          </Button>
          <Button
            isDisabled={isSubmitting}
            type="button"
            variant="secondary"
            onPress={() => reset()}
          >
            Limpiar
          </Button>
        </div>
      </Form>
    </DemoSection>
  );
}
