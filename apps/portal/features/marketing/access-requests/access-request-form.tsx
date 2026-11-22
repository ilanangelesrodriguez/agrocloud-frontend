"use client";

import type { AccessFormValues, AccessRequestPayload } from "./schema";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Link from "next/link";
import { usePublicOffers } from "@/features/marketing/plans/hooks/use-public-offers";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
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

export function AccessRequestForm({
  privacyVersion,
  initialOfferKey,
}: {
  privacyVersion: string;
  initialOfferKey?: string;
}) {
  const offers = usePublicOffers();
  const [selectedKey, setSelectedKey] = useState(initialOfferKey ?? ":free");
  const selected = offers.data?.find((offer) => offer.available && offer.key === selectedKey);
  const available = selectedKey === ":free" || !!selected;
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
    if (!available) {
      toast.danger("Selecciona un plan vigente o el acceso gratuito.");
      return;
    }

    try {
      const payload: AccessRequestPayload = {
        ...data,
        selected_offer_key: selectedKey === ":free" ? null : selectedKey,
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
      <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">Plan de interés</h2>
        <CatalogSelect
          label="Selecciona cómo comenzar"
          value={selectedKey}
          onChange={setSelectedKey}
          disabled={mutation.isPending}
          items={[
            { id: ":free", name: "Comenzar gratis · Sujeto a aprobación" },
            ...(offers.data ?? [])
              .filter((offer) => offer.available)
              .map((offer) => ({
                id: offer.key,
                name:
                  offer.name +
                  " · " +
                  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
                    offer.amount_cents / 100,
                  ) +
                  " por " +
                  offer.duration_days +
                  " días",
              })),
            ...(!available && initialOfferKey
              ? [{ id: initialOfferKey, name: "Selección no disponible · Elige otra opción" }]
              : []),
          ]}
        />
        {selected ? (
          <p className="text-xs text-muted">
            {selected.limits.usuarios} usuarios · {selected.limits.lotes} lotes ·{" "}
            {selected.limits.analisis_ia} análisis IA. Confirmarás el precio y las condiciones
            vigentes después de activar tu cuenta.
          </p>
        ) : null}
        {!available ? (
          <p className="text-sm text-warning" role="status">
            {offers.isPending
              ? "Consultando el plan elegido…"
              : "No pudimos confirmar que el plan elegido siga disponible. Elige otra opción antes de enviar."}
          </p>
        ) : null}
        {offers.isError ? (
          <p className="text-xs text-muted">
            No se pudieron consultar los planes de pago. Puedes comenzar gratis o volver a intentar
            desde{" "}
            <Link href="/planes" className="text-accent underline">
              Planes
            </Link>
            .
          </p>
        ) : null}
        <p className="text-xs leading-relaxed text-muted">
          Esta selección no genera cobros. Primero revisaremos la empresa y enviaremos la invitación
          de activación. El acceso gratuito empieza al activar al administrador.
        </p>
        <p className="text-xs text-muted">
          ¿Tu empresa ya tiene una solicitud o una cuenta? Continúa con su revisión o{" "}
          <Link
            className="font-medium text-accent"
            href={
              selectedKey !== ":free" && /^[A-Za-z0-9_-]{1,60}$/.test(selectedKey)
                ? "/login?" +
                  new URLSearchParams({ next: "/settings/subscription", offer: selectedKey })
                : "/login"
            }
          >
            inicia sesión
          </Link>
          ; no envíes otra solicitud empresarial.
        </p>
      </section>
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
        isDisabled={!available}
        error={mutation.error instanceof Error ? mutation.error.message : null}
        isPending={mutation.isPending}
      />
    </Form>
  );
}
