"use client";

import type { FormEvent } from "react";
import type { Offer } from "../schema";
import { useState } from "react";
import { Button, Checkbox, Input, Label, ListBox, Select, TextField, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { adminRequest } from "@/features/admin/api";
import { AdminError } from "@/features/admin/components/admin-ui";
import { kinds, money, offerDetail, offerInput, offerList } from "../schema";

const stateLabels = { DRAFT: "Borrador", PUBLISHED: "Publicada", ARCHIVED: "Archivada" };
const kindLabels = { PLAN: "Plan", RENEWAL: "Renovación", USER_ADDON: "Usuarios adicionales", LOT_ADDON: "Lotes adicionales", AI_ADDON: "Análisis IA adicionales" };
const listKey = ["admin", "billing-offers"];
const linkClass = "text-accent underline";

export function OfferList() {
  const query = useQuery({ queryKey: listKey, queryFn: ({ signal }) => adminRequest("billing-offers", offerList, { signal }), retry: false });

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Ofertas comerciales</h1>
      <Link className={linkClass} href="/admin/plans/new">Crear borrador</Link>
      {query.isPending ? <p role="status">Cargando ofertas…</p> : query.isError ? (
        <AdminError error={query.error} retry={() => { void query.refetch(); }} />
      ) : query.data.data.length ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {query.data.data.map((offer) => (
            <li className="p-4" key={offer.key}>
              <Link className={linkClass} href={"/admin/plans/" + offer.key}>{offer.terms.name}</Link>
              <p>{kindLabels[offer.terms.kind]} · {stateLabels[offer.status]} · Versión {offer.version} · {money.format(offer.terms.amount_cents / 100)}</p>
            </li>
          ))}
        </ul>
      ) : <p>No hay ofertas administradas.</p>}
    </section>
  );
}

export function OfferPage({ offerId, edit = false }: { offerId: string; edit?: boolean }) {
  const query = useQuery({ queryKey: [...listKey, offerId], queryFn: ({ signal }) => adminRequest("billing-offers/" + offerId, offerDetail, { signal }), retry: false });

  if (query.isPending) return <p role="status">Cargando oferta…</p>;
  if (query.isError) return <AdminError error={query.error} retry={() => { void query.refetch(); }} />;
  const offer = query.data.data;
  if (edit && offer.status !== "ARCHIVED") return <OfferForm key={offer.key} offer={offer} />;

  return <OfferSummary offer={offer} reload={() => { void query.refetch(); }} />;
}

async function saveOffer(input: object, key?: string) {
  return adminRequest(key ? "billing-offers/" + key : "billing-offers", offerDetail, {
    method: key ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

function OfferSummary({ offer, reload }: { offer: Offer; reload: () => void }) {
  const cache = useQueryClient();
  const { terms } = offer;
  const update = useMutation({
    mutationFn: (status: "PUBLISHED" | "ARCHIVED") => saveOffer({ ...terms, status, version: offer.version }, offer.key),
    onSuccess: (result) => {
      cache.setQueryData([...listKey, offer.key], result);
      void cache.invalidateQueries({ queryKey: listKey });
      toast.success("Nueva versión registrada");
    },
    retry: false,
  });

  return (
    <section className="space-y-4">
      <Link className={linkClass} href="/admin/plans">Volver a ofertas</Link>
      <h1 className="text-3xl font-semibold">{terms.name}</h1>
      <p>{offer.key} · {kindLabels[terms.kind]} · {stateLabels[offer.status]} · Versión {offer.version}</p>
      <dl className="grid gap-3 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
        {[
          ["Precio", money.format(terms.amount_cents / 100)], ["Descripción", terms.description],
          ["Plan asociado", terms.plan], ["Duración", terms.duration_days ? terms.duration_days + " días" : undefined],
          ["Usuarios", terms.limits?.usuarios], ["Lotes", terms.limits?.lotes], ["Análisis IA", terms.limits?.analisis_ia],
          ["Cantidad del complemento", terms.quantity], ["Visible en la web", terms.public ? "Sí" : "No"],
          ["Inicio de vigencia (UTC)", terms.valid_from], ["Fin de vigencia exclusivo (UTC)", terms.valid_until],
          ["Última versión registrada", offer.created_at], ["Responsable", offer.actor_id],
        ].filter(([, value]) => value != null).map(([label, value]) => (
          <div key={label}><dt className="text-muted">{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      {offer.status !== "ARCHIVED" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Link className={linkClass} href={"/admin/plans/" + offer.key + "/edit"}>Revisar oferta</Link>
          {offer.status === "DRAFT" ? <Button isDisabled={update.isPending} variant="primary" onPress={() => update.mutate("PUBLISHED")}>Publicar</Button> : null}
          <Button isDisabled={update.isPending} variant="secondary" onPress={() => {
            if (window.confirm("¿Archivar la oferta? Las órdenes existentes conservan sus condiciones.")) update.mutate("ARCHIVED");
          }}>Archivar</Button>
        </div>
      ) : null}
      {update.error ? <AdminError error={update.error} retry={() => { update.reset(); reload(); }} /> : null}
    </section>
  );
}

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
    const number = (name: string) => text(name) ? Number(text(name)) : undefined;
    const input = offerInput.safeParse({
      status: offer?.status ?? "DRAFT", kind, name: text("name"), description: text("description") || undefined,
      amount_cents: number("price") === undefined ? undefined : Math.round(Number(text("price")) * 100),
      public: kind === "PLAN" && publicOffer, valid_from: text("valid_from") || undefined, valid_until: text("valid_until") || undefined,
      ...(isPlan ? { plan: terms?.plan ?? text("plan"), duration_days: number("duration_days"),
        limits: { usuarios: number("usuarios"), lotes: number("lotes"), analisis_ia: number("analisis_ia") } } :
        { quantity: number("quantity") }),
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
      <Link className={linkClass} href={offer ? "/admin/plans/" + offer.key : "/admin/plans"}>Cancelar y volver</Link>
      <h1 className="text-3xl font-semibold">{offer ? "Revisar oferta" : "Crear borrador"}</h1>
      <form className="space-y-4" onSubmit={submit}>
        <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
          {offer ? <p>Versión {version} · {kindLabels[kind]}</p> : (
            <>
              <Field required label="Clave única" name="key" />
              <Select isDisabled={save.isPending} value={kind} onChange={(value) => {
                const selected = kinds.find((option) => option === value);
                if (selected) setKind(selected);
              }}>
                <Label>Tipo de oferta</Label>
                <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
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
          <Field required label="Nombre" name="name" initial={terms?.name} />
          <Field label="Descripción" name="description" initial={terms?.description} />
          <Field required label="Precio en soles" name="price" type="number" step="0.01" initial={terms ? terms.amount_cents / 100 : undefined} />
          {isPlan ? (
            <>
              {terms?.plan ? <p>Plan asociado: {terms.plan}</p> : <Field required label="Código de plan (mayúsculas)" name="plan" />}
              <Field required label="Duración en días" name="duration_days" type="number" initial={terms?.duration_days} />
              <Field required label="Usuarios" name="usuarios" type="number" initial={terms?.limits?.usuarios} />
              <Field required label="Lotes" name="lotes" type="number" initial={terms?.limits?.lotes} />
              <Field required label="Análisis IA" name="analisis_ia" type="number" initial={terms?.limits?.analisis_ia} />
            </>
          ) : <Field required label="Cantidad adicional" name="quantity" type="number" initial={terms?.quantity} />}
          <Field label="Inicio de vigencia (UTC)" name="valid_from" type="date" initial={terms?.valid_from} />
          <Field label="Fin de vigencia exclusivo (UTC)" name="valid_until" type="date" initial={terms?.valid_until} />
          {kind === "PLAN" ? <Checkbox isSelected={publicOffer} onChange={setPublic}>
            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Content>Mostrar en la web al publicar</Checkbox.Content>
          </Checkbox> : null}
        </fieldset>
        {error || save.error ? <p role="alert">{error || save.error?.message}</p> : null}
        <Button type="submit" variant="primary" isDisabled={save.isPending}>{save.isPending ? "Guardando…" : offer ? "Guardar nueva versión" : "Crear borrador"}</Button>
      </form>
    </section>
  );
}

function Field({ label, name, initial, type = "text", required, step }: {
  label: string; name: string; initial?: string | number; type?: "text" | "number" | "date"; required?: boolean; step?: string;
}) {
  return <TextField defaultValue={String(initial ?? "")} isRequired={required} name={name} type={type}>
    <Label>{label}</Label><Input className="w-full" step={step} />
  </TextField>;
}
