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

export function AccessRequestForm({ privacyVersion }: { privacyVersion: string }) {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const mutation = useSubmitAccessRequest();
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<AccessFormValues>({
    resolver: zodResolver(clientAccessFormSchema),
    defaultValues,
    // Evita mostrar bordes rojos mientras alguien aún completa el formulario.
    // Tras el primer intento de envío, los errores se corrigen en tiempo real.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async ({ consentimiento, ...data }) => {
    if (!consentimiento || mutation.isPending) return;

    try {
      const payload: AccessRequestPayload = {
        ...data,
        privacy_accepted: true,
        privacy_version: privacyVersion,
      };

      const result = await mutation.mutateAsync({ ...payload, website });

      toast.success("Solicitud enviada", { description: result.message });
      router.push(
        result.reference
          ? "/solicitud-recibida?" + new URLSearchParams({ reference: result.reference })
          : "/solicitud-recibida",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar la solicitud.";

      toast.danger("No se pudo enviar", { description: message });
    }
  });

  return (
    <Form
      aria-label="Solicitud de acceso empresarial"
      className="space-y-5"
      validationBehavior="aria"
      onSubmit={onSubmit}
    >
      <CompanyFields control={control} errors={errors} getValues={getValues} setValue={setValue} />
      <RepresentativeFields control={control} errors={errors} />
      <OperationFields
        control={control}
        errors={errors}
        privacyVersion={privacyVersion}
        register={register}
      />
      <HoneypotField value={website} onChange={setWebsite} />
      <SubmitActions
        error={mutation.error instanceof Error ? mutation.error.message : null}
        isPending={mutation.isPending}
      />
    </Form>
  );
}
