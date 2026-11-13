"use client";

import type { FormEvent } from "react";
import type { Producer } from "../schema";

import { useRef, useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { adminRequest } from "@/features/admin/api";
import { AdminError, AdminPagination } from "@/features/admin/components/admin-ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";

import { catalog, lotDetail, lotInput, lotList, producerDetail, producerInput, producerList } from "../schema";

type Resource = "producers" | "lots";
type Mode = "list" | "new" | "detail" | "edit";
const names = { producers: "Productores", lots: "Lotes" };
const basePermissions = { producers: "productores", lots: "lotes" };
const linkClass = "font-semibold text-accent underline";

export function AgriculturalPage({ resource, mode, id }: { resource: Resource; mode: Mode; id?: string }) {
  const { data: actor, isPending } = useCurrentUser();
  const prefix = basePermissions[resource];
  const canRead = canManageCompany(actor, prefix + ".ver");
  const canCreate = canManageCompany(actor, prefix + ".crear");
  const canEdit = resource === "producers" && canManageCompany(actor, "productores.editar");
  const allowed = mode === "new" ? canCreate : mode === "edit" ? canRead && canEdit : canRead;

  if (isPending) return <p role="status">Verificando permisos…</p>;
  if (!allowed) return <p role="alert">No tienes permiso para esta operación.</p>;

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-semibold">{names[resource]}</h1>
      <nav aria-label={names[resource]} className="flex flex-wrap gap-4">
        <Link className={linkClass} href="/dashboard">Panel empresarial</Link>
        {canRead && mode !== "list" ? <Link className={linkClass} href={"/" + resource}>Volver al listado</Link> : null}
        {canCreate && mode === "list" ? <Link className={linkClass} href={"/" + resource + "/new"}>Registrar {resource === "lots" ? "lote" : "productor"}</Link> : null}
      </nav>
      {mode === "list" ? <RecordList resource={resource} /> : null}
      {mode === "new" && resource === "producers" ? <ProducerForm canRead={canRead} /> : null}
      {mode === "new" && resource === "lots" ? <LotForm canRead={canRead} canReadProducers={canManageCompany(actor, "productores.ver")} /> : null}
      {id && (mode === "edit" || mode === "detail") ? (
        <RecordDetail canEdit={canEdit} edit={mode === "edit"} id={id} resource={resource} />
      ) : null}
    </section>
  );
}

function RecordList({ resource }: { resource: Resource }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["agricultural", resource, page],
    queryFn: async ({ signal }) => {
      const url = resource + "?page=" + page;
      if (resource === "producers") {
        const result = await adminRequest(url, producerList, { signal }, "agricultural");
        return { meta: result.meta, rows: result.data.map((row) => ({
          id: row.id_productor, title: row.nombre_razon_social, detail: row.ruc,
        })) };
      }
      const result = await adminRequest(url, lotList, { signal }, "agricultural");
      return { meta: result.meta, rows: result.data.map((row) => ({
        id: row.id_lote, title: row.codigo_lote, detail: row.producto + " · " + row.estado.replaceAll("_", " "),
      })) };
    },
    retry: false,
  });

  if (query.isPending) return <p role="status">Cargando…</p>;
  if (query.isError) return <AdminError error={query.error} retry={() => { void query.refetch(); }} />;

  return (
    <>
      {query.data.rows.length ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {query.data.rows.map((row) => (
            <li key={row.id} className="p-4">
              <Link className={linkClass} href={"/" + resource + "/" + row.id}>{row.title}</Link>
              <p className="text-sm text-muted">{row.detail}</p>
            </li>
          ))}
        </ul>
      ) : <p>No hay registros en esta página.</p>}
      <AdminPagination last={query.data.meta.last_page} page={page} onChange={setPage} />
    </>
  );
}

function RecordDetail({ resource, id, edit, canEdit }: { resource: Resource; id: string; edit: boolean; canEdit: boolean }) {
  const query = useQuery({
    queryKey: ["agricultural", resource, "detail", id],
    queryFn: async ({ signal }) => resource === "producers"
      ? { producer: (await adminRequest(resource + "/" + id, producerDetail, { signal }, "agricultural")).data, lot: null }
      : { producer: null, lot: (await adminRequest(resource + "/" + id, lotDetail, { signal }, "agricultural")).data },
    retry: false,
  });
  if (query.isPending) return <p role="status">Cargando registro…</p>;
  if (query.isError) return <AdminError error={query.error} retry={() => { void query.refetch(); }} />;

  const { producer, lot } = query.data;
  if (edit && producer) return <ProducerForm key={id} canRead producer={producer} />;

  const fields = producer ? [
    ["Razón social", producer.nombre_razon_social], ["RUC", producer.ruc], ["Fundo", producer.fundo],
    ["Ubicación", producer.ubicacion], ["Departamento", producer.departamento], ["Provincia", producer.provincia],
    ["Distrito", producer.distrito], ["Ubigeo", producer.ubigeo],
    ["Verificación tributaria", producer.sunat_verificacion?.resultado ?? "Sin resultado registrado"],
    ["Estado SUNAT", producer.sunat_verificacion?.estado], ["Condición SUNAT", producer.sunat_verificacion?.condicion],
  ] : lot ? [
    ["Código", lot.codigo_lote], ["Productor", lot.productor?.nombre_razon_social ?? String(lot.id_productor)],
    ["Producto", lot.producto], ["Variedad", lot.variedad],
    ["Peso", lot.peso_kg + " " + lot.unidad_medida], ["Estado", lot.estado.replaceAll("_", " ")],
    ["Llegada prevista", new Date(lot.fecha_llegada_prevista).toLocaleString("es-PE")],
  ] : [];

  return (
    <>
      <dl className="grid gap-4 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words">{value ?? "—"}</dd></div>
        ))}
      </dl>
      {canEdit && producer ? <Link className={linkClass} href={"/producers/" + id + "/edit"}>Editar productor</Link> : null}
    </>
  );
}

function Field({ name, label, initial, required, type = "text", maxLength, step }: {
  name: string; label: string; initial?: string | null; required?: boolean;
  type?: "text" | "number" | "datetime-local"; maxLength?: number; step?: string;
}) {
  return (
    <TextField defaultValue={initial ?? ""} isRequired={required} name={name} type={type}>
      <Label>{label}</Label>
      <Input className="w-full" maxLength={maxLength} step={step} />
    </TextField>
  );
}

const producerFields = [
  ["ruc", "RUC", 11], ["nombre_razon_social", "Razón social", 200],
  ["fundo", "Fundo", 200], ["ubicacion", "Ubicación", 250], ["departamento", "Departamento", 100],
  ["provincia", "Provincia", 100], ["distrito", "Distrito", 100], ["ubigeo", "Ubigeo", 6],
] as const;

function ProducerForm({ producer, canRead }: { producer?: Producer; canRead: boolean }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: (input: object) => adminRequest(
      producer ? "producers/" + producer.id_productor : "producers", producerDetail,
      { method: producer ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
      "agricultural",
    ),
    onSuccess: ({ data }) => {
      void cache.invalidateQueries({ queryKey: ["agricultural", "producers"] });
      router.push(canRead ? "/producers/" + data.id_productor : "/dashboard");
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const values = new FormData(event.currentTarget);
    const input = producerInput.safeParse(Object.fromEntries(
      producerFields.map(([key]) => [key, String(values.get(key) ?? "").trim() || null]),
    ));
    setError(input.success ? "" : input.error.issues[0]?.message ?? "Revisa los datos.");
    if (input.success) save.mutate(input.data);
  }

  return (
    <form className="space-y-4 rounded-card border border-border bg-surface p-5" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">{producer ? "Editar productor" : "Registrar productor"}</legend>
        {producerFields.map(([name, label, max]) => (
          <Field key={name} initial={producer?.[name]} label={label} maxLength={max} name={name} required={name === "ruc" || name === "nombre_razon_social"} />
        ))}
      </fieldset>
      {error || save.error ? <p role="alert">{error || save.error?.message}</p> : null}
      <Button isDisabled={save.isPending} type="submit" variant="primary">{save.isPending ? "Guardando…" : "Guardar productor"}</Button>
    </form>
  );
}

function LotForm({ canRead, canReadProducers }: { canRead: boolean; canReadProducers: boolean }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [product, setProduct] = useState("");
  const [producerPage, setProducerPage] = useState(1);
  const [producerId, setProducerId] = useState("");
  const [error, setError] = useState("");
  const attempts = useRef(new Map<string, string>());
  const [products, varieties, units] = useQueries({
    queries: (["producto", "variedad", "unidad"] as const).map((type) => ({
      queryKey: ["agricultural", "catalog", type],
      queryFn: ({ signal }: { signal: AbortSignal }) => adminRequest("catalogs?tipo=" + type, catalog, { signal }, "agricultural"),
      retry: false,
    })),
  });
  const producers = useQuery({
    enabled: canReadProducers,
    queryKey: ["agricultural", "lot-producers", producerPage],
    queryFn: ({ signal }) => adminRequest("producers?page=" + producerPage, producerList, { signal }, "agricultural"),
    retry: false,
  });
  const productId = products.data?.data.find((item) => item.nombre === product)?.id;
  const save = useMutation({
    mutationFn: ({ body, key }: { body: string; key: string }) => adminRequest("lots", lotDetail, {
      method: "POST", body, headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    }, "agricultural"),
    onSuccess: ({ data }) => {
      void cache.invalidateQueries({ queryKey: ["agricultural", "lots"] });
      void cache.invalidateQueries({ queryKey: ["company", "subscription"] });
      router.push(canRead ? "/lots/" + data.id_lote : "/dashboard");
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const fields = new FormData(event.currentTarget);
    const date = new Date(String(fields.get("fecha_llegada_prevista") ?? ""));
    const parsed = lotInput.safeParse({
      id_productor: Number(producerId), codigo_lote: fields.get("codigo_lote"),
      producto: product, variedad: fields.get("variedad") || null,
      peso_kg: Number(fields.get("peso_kg")), unidad_medida: fields.get("unidad_medida"),
      fecha_llegada_prevista: Number.isFinite(date.getTime()) ? date.toISOString() : "",
    });
    setError(parsed.success ? "" : parsed.error.issues[0]?.message ?? "Revisa los datos.");
    if (!parsed.success) return;
    const body = JSON.stringify(parsed.data);
    const key = attempts.current.get(body) ?? crypto.randomUUID();
    attempts.current.set(body, key);
    save.mutate({ body, key });
  }

  const catalogs = [products, varieties, units];
  const failed = catalogs.find((query) => query.isError);
  if (failed?.error) return <AdminError error={failed.error} retry={() => { void Promise.all(catalogs.map((query) => query.refetch())); }} />;
  if (catalogs.some((query) => query.isPending)) return <p role="status">Cargando catálogos…</p>;

  return (
    <form className="space-y-4 rounded-card border border-border bg-surface p-5" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">Registrar lote</legend>
        <div className="space-y-2">
          {canReadProducers ? (
            <>
              <label className="grid gap-1">Productor
                <select required className="rounded-field border border-border bg-surface p-2" value={producerId} onChange={(event) => setProducerId(event.target.value)}>
                  <option value="">Selecciona un productor</option>
                  {producers.data?.data.map((producer) => <option key={producer.id_productor} value={producer.id_productor}>{producer.nombre_razon_social}</option>)}
                </select>
              </label>
              {producers.isPending ? <p role="status">Cargando productores…</p> : null}
              {producers.isError ? <p role="alert">{producers.error.message}</p> : null}
              {producers.data && producers.data.meta.last_page > 1 ? (
                <AdminPagination last={producers.data.meta.last_page} page={producerPage} onChange={(next) => { setProducerId(""); setProducerPage(next); }} />
              ) : null}
            </>
          ) : (
            <label className="grid gap-1">ID del productor
              <input required className="rounded-field border border-border bg-surface p-2" min={1} type="number" value={producerId} onChange={(event) => setProducerId(event.target.value)} />
            </label>
          )}
        </div>
        <Field required label="Código del lote" maxLength={50} name="codigo_lote" />
        <label className="grid gap-1">Producto
          <select required className="rounded-field border border-border bg-surface p-2" value={product} onChange={(event) => setProduct(event.target.value)}>
            <option value="">Selecciona un producto</option>
            {products.data?.data.map((item) => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
          </select>
        </label>
        <label className="grid gap-1">Variedad
          <select key={productId} className="rounded-field border border-border bg-surface p-2" disabled={!productId} name="variedad">
            <option value="">Sin variedad</option>
            {varieties.data?.data.filter((item) => item.parent_id === productId).map((item) => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
          </select>
        </label>
        <Field required label="Peso" name="peso_kg" step="any" type="number" />
        <label className="grid gap-1">Unidad de medida
          <select required className="rounded-field border border-border bg-surface p-2" name="unidad_medida">
            <option value="">Selecciona una unidad</option>
            {units.data?.data.map((item) => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
          </select>
        </label>
        <Field required label="Llegada prevista (hora local)" name="fecha_llegada_prevista" type="datetime-local" />
      </fieldset>
      {error || save.error ? <p role="alert">{error || save.error?.message}</p> : null}
      <Button isDisabled={save.isPending} type="submit" variant="primary">{save.isPending ? "Guardando…" : "Guardar lote"}</Button>
    </form>
  );
}
