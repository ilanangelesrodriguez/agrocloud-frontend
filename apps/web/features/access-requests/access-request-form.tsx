"use client";

import type { AccessFormValues, AccessRequestPayload } from "./schema";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CompanyFields } from "./components/company-fields";
import { HoneypotField } from "./components/honeypot-field";
import { OperationFields } from "./components/operation-fields";
import { RepresentativeFields } from "./components/representative-fields";
import { SubmitActions } from "./components/submit-actions";
import { useSubmitAccessRequest } from "./hooks/use-submit-access-request";
import { clientAccessFormSchema } from "./schema";

const defaultValues: AccessFormValues = {
  ruc: "",
  razon_social: "",
  nombre_comercial: "",
  tipo_empresa: "",
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  uso: "",
  consentimiento: false,
};

export function AccessRequestForm() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const mutation = useSubmitAccessRequest();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessFormValues>({
    resolver: zodResolver(clientAccessFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async ({ consentimiento, ...data }) => {
    if (!consentimiento || mutation.isPending) return;

    try {
      const payload: AccessRequestPayload = data;

      await mutation.mutateAsync({ ...payload, website });
      toast.success("Solicitud registrada", { description: "Recibimos los datos de tu empresa." });
      router.push("/solicitud-recibida");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar la solicitud.";

      toast.danger("No se pudo enviar", { description: message });
    }
  });

  return (
    <Form
      aria-label="Solicitud de acceso empresarial"
      className="space-y-6"
      validationBehavior="aria"
      onSubmit={onSubmit}
    >
      <CompanyFields control={control} errors={errors} register={register} />
      <RepresentativeFields errors={errors} register={register} />
      <OperationFields control={control} errors={errors} register={register} />
      <HoneypotField value={website} onChange={setWebsite} />
      <SubmitActions
        error={mutation.error instanceof Error ? mutation.error.message : null}
        isPending={mutation.isPending}
      />
    </Form>
  );
}
