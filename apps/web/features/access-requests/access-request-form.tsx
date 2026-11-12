"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { clientAccessFormSchema, companyTypes } from "./schema";
import type { AccessFormValues, AccessRequestPayload } from "./schema";

type Name = Exclude<keyof AccessFormValues, "consentimiento" | "tipo_empresa" | "uso">;

function CompanyInput({ name, label, placeholder, register, errors, type = "text", autoComplete, maxLength, inputMode }: {
  name: Name; label: string; placeholder: string;
  register: UseFormRegister<AccessFormValues>;
  errors: FieldErrors<AccessFormValues>;
  type?: string; autoComplete?: string; maxLength?: number; inputMode?: "numeric" | "tel";
}) {
  const error = errors[name]?.message;
  return <TextField className="flex min-w-0 flex-col gap-1.5" isInvalid={Boolean(error)}>
    <Label htmlFor={name} className="text-sm font-semibold text-foreground">{label} <span className="text-danger">*</span></Label>
    <Input id={name} type={type} inputMode={inputMode} autoComplete={autoComplete} maxLength={maxLength} placeholder={placeholder} className="min-h-11 w-full rounded-xl" aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...register(name)} />
    {error && <p id={`${name}-error`} role="alert" className="text-xs text-danger">{String(error)}</p>}
  </TextField>;
}

export function AccessRequestForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [website, setWebsite] = useState(""); // Campo señuelo contra envío automatizado.
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccessFormValues>({
    resolver: zodResolver(clientAccessFormSchema),
    mode: "onBlur",
    defaultValues: { ruc: "", razon_social: "", nombre_comercial: "", tipo_empresa: "", nombre: "", apellido: "", correo: "", telefono: "", uso: "", consentimiento: false },
  });
  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { consentimiento: _consentimiento, ...payload }: AccessFormValues = values;
    const requestPayload: AccessRequestPayload = payload;
    void _consentimiento; // El backend actual no declara este campo. Ver guía para trazabilidad legal.
    try {
      const response = await fetch("/api/access-requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestPayload, website }),
        signal: AbortSignal.timeout(20000),
      });
      const result: { message?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = result.message || "No pudimos registrar la solicitud. Intenta nuevamente.";
        setServerError(message);
        toast.danger("No se pudo enviar", { description: message });
        return;
      }
      toast.success("Solicitud registrada", { description: "Recibimos los datos de tu empresa." });
      router.push("/solicitud-recibida");
    } catch {
      setServerError("No se pudo conectar con el servicio. Intenta nuevamente más tarde.");
      toast.danger("Sin conexión", { description: "No se pudo completar el envío." });
    }
  });
  return <form noValidate onSubmit={onSubmit} className="space-y-6">
    <div className="site-card p-6 sm:p-8">
      <div className="mb-6 border-b border-border pb-5"><span className="font-mono text-sm font-semibold text-accent">01 / Empresa</span><h2 className="mt-2 text-xl font-semibold">Información de la organización</h2><p className="mt-2 text-sm text-muted">Ingresa los datos legales. La consulta automática de RUC está pendiente de una API pública confirmada.</p></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <CompanyInput name="ruc" label="RUC" placeholder="11 dígitos" inputMode="numeric" maxLength={11} register={register} errors={errors}/>
        <CompanyInput name="nombre_comercial" label="Nombre comercial" placeholder="Nombre de la empresa" autoComplete="organization" maxLength={150} register={register} errors={errors}/>
        <div className="sm:col-span-2"><CompanyInput name="razon_social" label="Razón social" placeholder="Razón social registrada" maxLength={200} register={register} errors={errors}/></div>
        <div className="sm:col-span-2"><label htmlFor="tipo_empresa" className="mb-2 block text-sm font-semibold">Tipo de empresa <span className="text-danger">*</span></label>
          <select id="tipo_empresa" className="site-native-field" aria-invalid={Boolean(errors.tipo_empresa)} aria-describedby={errors.tipo_empresa ? "tipo_empresa-error" : undefined} {...register("tipo_empresa")}>
            <option value="">Selecciona la actividad</option>{companyTypes.map(item=><option value={item} key={item}>{item}</option>)}
          </select>{errors.tipo_empresa && <p role="alert" id="tipo_empresa-error" className="mt-1 text-xs text-danger">{errors.tipo_empresa.message}</p>}
        </div>
      </div>
    </div>
    <div className="site-card p-6 sm:p-8">
      <div className="mb-6 border-b border-border pb-5"><span className="font-mono text-sm font-semibold text-accent">02 / Representante</span><h2 className="mt-2 text-xl font-semibold">Persona de contacto</h2><p className="mt-2 text-sm text-muted">Utilizaremos estos datos para atender la solicitud empresarial.</p></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <CompanyInput name="nombre" label="Nombres" placeholder="Nombres" autoComplete="given-name" maxLength={100} register={register} errors={errors}/>
        <CompanyInput name="apellido" label="Apellidos" placeholder="Apellidos" autoComplete="family-name" maxLength={100} register={register} errors={errors}/>
        <CompanyInput name="correo" label="Correo electrónico" placeholder="nombre@empresa.com" type="email" autoComplete="email" maxLength={255} register={register} errors={errors}/>
        <CompanyInput name="telefono" label="Teléfono" placeholder="+51 987 654 321" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} register={register} errors={errors}/>
      </div>
    </div>
    <div className="site-card p-6 sm:p-8">
      <div className="mb-6 border-b border-border pb-5"><span className="font-mono text-sm font-semibold text-accent">03 / Necesidades</span><h2 className="mt-2 text-xl font-semibold">Tu operación agrícola</h2><p className="mt-2 text-sm text-muted">Describe para qué necesitaría AgroCloud tu empresa.</p></div>
      <label htmlFor="uso" className="mb-2 block text-sm font-semibold">¿Cómo planeas utilizar AgroCloud? <span className="text-danger">*</span></label>
      <textarea id="uso" rows={5} maxLength={4000} placeholder="Por ejemplo: necesitamos registrar recepciones de palta, realizar muestreos, gestionar inspecciones y consultar los dictámenes de calidad..." className="site-native-field min-h-32 resize-y" aria-invalid={Boolean(errors.uso)} aria-describedby={errors.uso ? "uso-error" : "uso-help"} {...register("uso")}/>
      {errors.uso ? <p role="alert" id="uso-error" className="mt-1 text-xs text-danger">{errors.uso.message}</p>:<p id="uso-help" className="mt-2 text-xs text-muted">Entre 20 y 4 000 caracteres.</p>}
      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm leading-6 text-muted">
        <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[#146F47]" aria-invalid={Boolean(errors.consentimiento)} {...register("consentimiento")}/>
        <span>He leído la <Link href="/privacidad" className="font-semibold text-accent underline underline-offset-2">información de privacidad</Link> y autorizo usar mis datos para evaluar esta solicitud.</span>
      </label>
      {errors.consentimiento && <p role="alert" className="mt-2 text-xs text-danger">{errors.consentimiento.message}</p>}
      <div className="sr-only" aria-hidden="true"><label htmlFor="website">Sitio web (dejar vacío)</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)} /></div>
    </div>
    {serverError && <p className="rounded-xl border border-danger/30 bg-danger-soft/25 p-4 text-sm text-foreground" role="alert">{serverError}</p>}
    <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><p className="max-w-lg text-xs leading-6 text-muted">Enviar la solicitud no garantiza la aprobación. No necesitas crear una contraseña en este paso.</p>
      <Button type="submit" variant="primary" size="lg" isPending={isSubmitting} isDisabled={isSubmitting} className="w-full justify-center sm:w-auto">{isSubmitting ? "Enviando…" : "Enviar solicitud"}</Button>
    </div>
  </form>;
}
