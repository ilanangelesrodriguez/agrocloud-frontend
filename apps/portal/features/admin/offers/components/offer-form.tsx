"use client";

import type { FormEvent } from "react";
import type { Offer } from "../schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Label, ListBox, Select } from "@heroui/react";
import { FormNotice, PageHeader } from "@agrocloud/ui";
import { saveOffer } from "../api";
import { kinds, offerInput } from "../schema";
import { kindLabels, linkClass, listKey } from "../labels";
import { OfferField } from "./offer-field";

export function OfferForm({ offer }: { offer?: Offer }) {
  const router = useRouter();
  const cache = useQueryClient();
  const terms = offer?.terms;
  const [kind, setKind] = useState<(typeof kinds)[number]>(terms?.kind ?? "PLAN");
  const [publicOffer, setPublic] = useState(terms?.public ?? false);
  const [version] = useState(offer?.version);
  const [error, setError] = useState("");
  const isPlan = kind === "PLAN" || kind === "RENEWAL";
  const save = useMutation({
    mutationFn: (input: object) => saveOffer(input, offer?.key),
    onSuccess: (result) => {
      cache.setQueryData([...listKey, result.data.key], result);
      void cache.invalidateQueries({ queryKey: listKey });
      router.push("/admin/plans/" + result.data.key);
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const fields = new FormData(event.currentTarget);
    const text = (name: string) => String(fields.get(name) ?? "").trim();
    const number = (name: string) => (text(name) ? Number(text(name)) : undefined);
    const input = offerInput.safeParse({
      status: offer?.status ?? "DRAFT",
      kind,
      name: text("name"),
      description: text("description") || undefined,
      amount_cents:
        number("price") === undefined ? undefined : Math.round(Number(text("price")) * 100),
      public: kind === "PLAN" && publicOffer,
      valid_from: text("valid_from") || undefined,
      valid_until: text("valid_until") || undefined,
      ...(isPlan
        ? {
            plan: terms?.plan ?? text("plan"),
            duration_days: number("duration_days"),
            limits: {
              usuarios: number("usuarios"),
              lotes: number("lotes"),
              analisis_ia: number("analisis_ia"),
            },
          }
        : { quantity: number("quantity") }),
    });

    if (!input.success) {
      setError(input.error.issues[0]?.message ?? "Revisa los datos.");

      return;
    }
    setError("");
    save.mutate({ ...input.data, ...(offer ? { version } : { key: text("key") }) });
  }

  return (
    <section className="space-y-4">
      <Link className={linkClass} href={offer ? "/admin/plans/" + offer.key : "/admin/plans"}>
        Cancelar y volver
      </Link>
      <PageHeader title={offer ? "Revisar oferta" : "Crear borrador"} />
      <form className="space-y-4" onSubmit={submit}>
        <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
          {offer ? (
            <p>
              Versión {version} · {kindLabels[kind]}
            </p>
          ) : (
            <>
              <OfferField required label="Clave única" name="key" />
              <Select
                isDisabled={save.isPending}
                value={kind}
                onChange={(value) => {
                  const selected = kinds.find((option) => option === value);

                  if (selected) setKind(selected);
                }}
              >
                <Label>Tipo de oferta</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox aria-label="Tipos de oferta">
                    {kinds.map((value) => (
                      <ListBox.Item key={value} id={value} textValue={kindLabels[value]}>
                        {kindLabels[value]}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </>
          )}
          <OfferField required initial={terms?.name} label="Nombre" name="name" />
          <OfferField initial={terms?.description} label="Descripción" name="description" />
          <OfferField
            required
            initial={terms ? terms.amount_cents / 100 : undefined}
            label="Precio en soles"
            name="price"
            step="0.01"
            type="number"
          />
          {isPlan ? (
            <>
              {terms?.plan ? (
                <p>Plan asociado: {terms.plan}</p>
              ) : (
                <OfferField required label="Código de plan (mayúsculas)" name="plan" />
              )}
              <OfferField
                required
                initial={terms?.duration_days}
                label="Duración en días"
                name="duration_days"
                type="number"
              />
              <OfferField
                required
                initial={terms?.limits?.usuarios}
                label="Usuarios"
                name="usuarios"
                type="number"
              />
              <OfferField
                required
                initial={terms?.limits?.lotes}
                label="Lotes"
                name="lotes"
                type="number"
              />
              <OfferField
                required
                initial={terms?.limits?.analisis_ia}
                label="Análisis IA"
                name="analisis_ia"
                type="number"
              />
            </>
          ) : (
            <OfferField
              required
              initial={terms?.quantity}
              label="Cantidad adicional"
              name="quantity"
              type="number"
            />
          )}
          <OfferField
            initial={terms?.valid_from}
            label="Inicio de vigencia (UTC)"
            name="valid_from"
            type="date"
          />
          <OfferField
            initial={terms?.valid_until}
            label="Fin de vigencia exclusivo (UTC)"
            name="valid_until"
            type="date"
          />
          {kind === "PLAN" ? (
            <Checkbox isSelected={publicOffer} onChange={setPublic}>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>Mostrar en la web al publicar</Checkbox.Content>
            </Checkbox>
          ) : null}
        </fieldset>
        {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
        <Button isDisabled={save.isPending} type="submit" variant="primary">
          {save.isPending ? "Guardando…" : offer ? "Guardar nueva versión" : "Crear borrador"}
        </Button>
      </form>
    </section>
  );
}
