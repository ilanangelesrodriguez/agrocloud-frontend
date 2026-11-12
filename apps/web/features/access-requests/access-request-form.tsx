"use client";

import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Checkbox,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FiAtSign, FiHash, FiPhone, FiSend } from "react-icons/fi";

import { clientAccessFormSchema, companyTypes } from "@/features/access-requests/schema";
import type { AccessFormValues, AccessRequestPayload } from "@/features/access-requests/schema";

type TextFieldName = Exclude<keyof AccessFormValues, "consentimiento" | "tipo_empresa" | "uso">;

type CompanyInputProps = {
  name: TextFieldName;
  label: string;
  placeholder: string;
  register: UseFormRegister<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
  inputMode?: "numeric" | "tel";
  prefix?: "ruc" | "email" | "phone";
};

function CompanyInput({
  name,
  label,
  placeholder,
  register,
  errors,
  type = "text",
  autoComplete,
  maxLength,
  inputMode,
  prefix,
}: CompanyInputProps) {
  const message = errors[name]?.message;
  const isInvalid = Boolean(message);
  const registration = register(name);

  const inputProps = {
    id: name,
    placeholder,
    type,
    autoComplete,
    maxLength,
    inputMode,
    ...registration,
  };

  return (
    <TextField className="flex min-w-0 flex-col gap-1.5" isInvalid={isInvalid} name={name}>
      <Label className="text-sm font-semibold text-foreground">
        {label} <span className="text-danger">*</span>
      </Label>

      {prefix ? (
        <InputGroup className="min-h-11 w-full">
          <InputGroup.Prefix aria-hidden="true" className="text-muted">
            {prefix === "ruc" && <FiHash className="size-4" />}
            {prefix === "email" && <FiAtSign className="size-4" />}
            {prefix === "phone" && <FiPhone className="size-4" />}
          </InputGroup.Prefix>
          <InputGroup.Input {...inputProps} />
        </InputGroup>
      ) : (
        <Input {...inputProps} className="min-h-11 w-full rounded-xl" />
      )}

      <FieldError>{message ? String(message) : undefined}</FieldError>
    </TextField>
  );
}

const initialValues: AccessFormValues = {
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AccessFormValues>({
    resolver: zodResolver(clientAccessFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const submitRequest = handleSubmit(async (values) => {
    setServerError(null);

    // Identity todavía no dispone de un campo de consentimiento en su contrato.
    // Revisar su persistencia antes de publicar el formulario con datos reales.
    const { consentimiento, ...requestPayload }: AccessFormValues = values;
    if (!consentimiento) return;

    const payload: AccessRequestPayload = requestPayload;

    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website }),
        signal: AbortSignal.timeout(20_000),
      });

      const result: { message?: string } = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = result.message ?? "No pudimos registrar la solicitud. Intenta nuevamente.";

        setServerError(message);
        toast.danger("No se pudo enviar", { description: message });
        return;
      }

      toast.success("Solicitud registrada", {
        description: "Recibimos los datos de tu empresa.",
      });
      router.push("/solicitud-recibida");
    } catch {
      const message = "No se pudo conectar con el servicio. Intenta nuevamente más tarde.";
      setServerError(message);
      toast.danger("Sin conexión", { description: message });
    }
  });

  return (
    <Form
      aria-label="Solicitud de acceso empresarial"
      className="space-y-6"
      validationBehavior="aria"
      onSubmit={submitRequest}
    >
      <Card className="site-card">
        <Card.Content className="p-6 sm:p-8">
          <Fieldset className="site-form-fieldset">
            <Fieldset.Legend className="grid gap-2">
              <span className="font-mono text-sm font-semibold text-accent">01 / Empresa</span>
              <span>Información de la organización</span>
            </Fieldset.Legend>
            <p className="text-sm leading-7 text-muted">
              Ingresa los datos legales. La consulta automática del RUC requiere que el backend
              publique un endpoint compatible.
            </p>

            <Fieldset.Group className="grid gap-5 pt-4 sm:grid-cols-2">
              <CompanyInput
                name="ruc"
                label="RUC"
                placeholder="11 dígitos"
                prefix="ruc"
                inputMode="numeric"
                maxLength={11}
                register={register}
                errors={errors}
              />
              <CompanyInput
                name="nombre_comercial"
                label="Nombre comercial"
                placeholder="Nombre de la empresa"
                autoComplete="organization"
                maxLength={150}
                register={register}
                errors={errors}
              />
              <div className="sm:col-span-2">
                <CompanyInput
                  name="razon_social"
                  label="Razón social"
                  placeholder="Razón social registrada"
                  maxLength={200}
                  register={register}
                  errors={errors}
                />
              </div>
              <div className="sm:col-span-2">
                <Controller
                  name="tipo_empresa"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      value={field.value || null}
                      onChange={(selected) =>
                        field.onChange(selected == null ? "" : String(selected))
                      }
                      onBlur={field.onBlur}
                      isInvalid={Boolean(errors.tipo_empresa)}
                      placeholder="Selecciona la actividad"
                    >
                      <Label>Tipo de empresa *</Label>
                      <Select.Trigger className="min-h-11 w-full">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <FieldError>{errors.tipo_empresa?.message}</FieldError>
                      <Select.Popover>
                        <ListBox aria-label="Tipos de empresa">
                          {companyTypes.map((companyType) => (
                            <ListBox.Item
                              key={companyType}
                              id={companyType}
                              textValue={companyType}
                            >
                              <Label>{companyType}</Label>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                />
              </div>
            </Fieldset.Group>
          </Fieldset>
        </Card.Content>
      </Card>

      <Card className="site-card">
        <Card.Content className="p-6 sm:p-8">
          <Fieldset className="site-form-fieldset">
            <Fieldset.Legend className="grid gap-2">
              <span className="font-mono text-sm font-semibold text-accent">
                02 / Representante
              </span>
              <span>Persona de contacto</span>
            </Fieldset.Legend>
            <p className="text-sm leading-7 text-muted">
              Utilizaremos esta información para atender la solicitud empresarial.
            </p>

            <Fieldset.Group className="grid gap-5 pt-4 sm:grid-cols-2">
              <CompanyInput
                name="nombre"
                label="Nombres"
                placeholder="Nombres"
                autoComplete="given-name"
                maxLength={100}
                register={register}
                errors={errors}
              />
              <CompanyInput
                name="apellido"
                label="Apellidos"
                placeholder="Apellidos"
                autoComplete="family-name"
                maxLength={100}
                register={register}
                errors={errors}
              />
              <CompanyInput
                name="correo"
                label="Correo electrónico"
                placeholder="nombre@empresa.com"
                type="email"
                prefix="email"
                autoComplete="email"
                maxLength={255}
                register={register}
                errors={errors}
              />
              <CompanyInput
                name="telefono"
                label="Teléfono"
                placeholder="+51 987 654 321"
                type="tel"
                prefix="phone"
                inputMode="tel"
                autoComplete="tel"
                maxLength={30}
                register={register}
                errors={errors}
              />
            </Fieldset.Group>
          </Fieldset>
        </Card.Content>
      </Card>

      <Card className="site-card">
        <Card.Content className="p-6 sm:p-8">
          <Fieldset className="site-form-fieldset">
            <Fieldset.Legend className="grid gap-2">
              <span className="font-mono text-sm font-semibold text-accent">03 / Necesidades</span>
              <span>Tu operación agrícola</span>
            </Fieldset.Legend>
            <p className="text-sm leading-7 text-muted">
              Describe para qué necesitaría AgroCloud tu empresa.
            </p>

            <Fieldset.Group className="grid gap-5 pt-4">
              <TextField isInvalid={Boolean(errors.uso)}>
                <Label>¿Cómo planeas utilizar AgroCloud? *</Label>
                <TextArea
                  {...register("uso")}
                  rows={5}
                  maxLength={4000}
                  className="min-h-32 w-full resize-y"
                  placeholder="Por ejemplo: necesitamos registrar recepciones de palta, realizar muestreos e inspecciones y consultar los dictámenes de calidad."
                />
                <Description>Entre 20 y 4 000 caracteres.</Description>
                <FieldError>{errors.uso?.message}</FieldError>
              </TextField>

              <Controller
                name="consentimiento"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    name={field.name}
                    isSelected={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isInvalid={Boolean(errors.consentimiento)}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <Checkbox.Content className="flex items-start gap-3">
                      <Checkbox.Control className="mt-1 shrink-0">
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <span className="text-sm leading-6 text-muted">
                        He leído la{" "}
                        <NextLink
                          href="/privacidad"
                          className="font-semibold text-accent underline underline-offset-2"
                        >
                          información de privacidad
                        </NextLink>{" "}
                        y autorizo utilizar mis datos para evaluar esta solicitud.
                      </span>
                    </Checkbox.Content>
                    <FieldError>{errors.consentimiento?.message}</FieldError>
                  </Checkbox>
                )}
              />
            </Fieldset.Group>
          </Fieldset>

          {/* Honeypot anti-bot: intencionalmente nativo, invisible y no interactivo. */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="website">Sitio web (dejar vacío)</label>
            <input
              id="website"
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        </Card.Content>
      </Card>

      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger-soft/25 p-4 text-sm text-foreground"
        >
          {serverError}
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <p className="max-w-lg text-xs leading-6 text-muted">
          Enviar la solicitud no garantiza su aprobación. No necesitas crear una contraseña en este
          paso.
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isPending={isSubmitting}
          isDisabled={isSubmitting}
          className="w-full justify-center sm:w-auto"
        >
          <FiSend className="size-4" aria-hidden="true" />
          {isSubmitting ? "Enviando…" : "Enviar solicitud"}
        </Button>
      </div>
    </Form>
  );
}
