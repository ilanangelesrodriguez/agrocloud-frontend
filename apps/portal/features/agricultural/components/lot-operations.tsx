"use client";

import type { FormEvent } from "react";
import type { Lot } from "../schema";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Label, ListBox, Select, TextArea, TextField, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  receptionDocuments,
  receptionInput,
  receptionResponse,
  traceabilityResponse,
} from "../schema";

import { SamplingForm } from "./sampling-form";

import { adminRequest } from "@/features/admin/api";
import { AdminError, AdminPagination } from "@/features/admin/components/admin-ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";

export function LotOperations({ lot }: { lot: Lot }) {
  const { data: actor } = useCurrentUser();
  const reception = lot.recepcion;
  const canReceive =
    lot.estado === "PENDIENTE_RECEPCION" &&
    !reception &&
    actor?.rol?.codigo === "RECEPCION" &&
    canManageCompany(actor, "recepciones.crear");

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-card border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Recepción</h2>
        {reception ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Documento", reception.tipo_documento + " · " + reception.documento],
              ["Transportista", reception.transportista],
              ["Placa", reception.placa],
              ["Peso recibido", reception.peso_recibido_kg + " kg"],
              ["Recibido el", new Date(reception.recibido_en).toLocaleString("es-PE")],
              ["Observaciones", reception.observaciones],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="break-words">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        ) : canReceive ? (
          <ReceptionForm lot={lot} />
        ) : (
          <p className="text-muted">El lote no tiene una recepción registrada.</p>
        )}
      </section>
      <section className="space-y-2 rounded-card border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Muestreos</h2>
        {lot.muestreos?.length ? (
          <ul>
            {lot.muestreos.map(({ id_muestreo, metodo, tamano_muestra, estado }) => (
              <li key={id_muestreo}>
                <Link className="text-accent underline" href={"/samplings/" + id_muestreo}>
                  Muestreo #{id_muestreo}
                </Link>{" "}
                ·{" "}
                {[metodo, tamano_muestra ? tamano_muestra + " frutos" : null, estado]
                  .filter(Boolean)
                  .join(" · ")}
              </li>
            ))}
          </ul>
        ) : lot.estado === "RECIBIDO" &&
          reception &&
          actor?.rol?.codigo === "INSPECTOR" &&
          canManageCompany(actor, "muestreos.crear") ? (
          <SamplingForm lotId={lot.id_lote} product={lot.producto} />
        ) : (
          <p className="text-muted">Sin muestreos registrados.</p>
        )}
      </section>
      {canManageCompany(actor, "trazabilidad.ver") ? <Traceability id={lot.id_lote} /> : null}
    </div>
  );
}

function Traceability({ id }: { id: number }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["agricultural", "lots", "traceability", id, page],
    queryFn: ({ signal }) =>
      adminRequest(
        "lots/" + id + "/traceability?page=" + page,
        traceabilityResponse,
        { signal },
        "agricultural",
      ),
    retry: false,
  });

  return (
    <section className="space-y-3 rounded-card border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">Trazabilidad</h2>
      {query.isPending ? (
        <p role="status">Cargando eventos…</p>
      ) : query.isError ? (
        <AdminError
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : (
        <>
          {query.data.data.length ? (
            <ul className="space-y-2">
              {query.data.data.map((item) => (
                <li key={item.id}>
                  {item.evento.replaceAll("_", " ")}
                  {item.created_at ? " · " + item.created_at : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin eventos en esta página.</p>
          )}
          <AdminPagination last={query.data.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}

function ReceptionForm({ lot }: { lot: Lot }) {
  const cache = useQueryClient();
  const [documentType, setDocumentType] = useState<string>(receptionDocuments[0]);
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: (body: object) =>
      adminRequest(
        "lots/" + lot.id_lote + "/reception",
        receptionResponse,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        },
        "agricultural",
      ),
    onSuccess: ({ data }) => {
      cache.setQueryData<{ producer: null; lot: Lot }>(
        ["agricultural", "lots", "detail", String(lot.id_lote)],
        (previous) =>
          previous
            ? { producer: null, lot: { ...previous.lot, recepcion: data, estado: "RECIBIDO" } }
            : previous,
      );
      toast.success("Recepción registrada");
      void cache.invalidateQueries({ queryKey: ["agricultural", "lots"] });
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const fields = new FormData(event.currentTarget);
    const text = (name: string) => String(fields.get(name) ?? "").trim();
    const date = new Date(text("recibido_en"));
    const weight = Number(text("peso_recibido_kg"));
    const notes = text("observaciones");

    if (date.getTime() > Date.now()) {
      setError("La recepción no puede tener una fecha futura.");

      return;
    }
    if (
      weight > 0 &&
      Math.round(weight * 100) !== Math.round(Number(lot.peso_kg) * 100) &&
      !notes
    ) {
      setError("Explica la diferencia de peso en las observaciones.");

      return;
    }
    const result = receptionInput.safeParse({
      tipo_documento: documentType,
      documento: text("documento"),
      transportista: text("transportista") || null,
      placa: text("placa") || null,
      peso_recibido_kg: weight,
      recibido_en: Number.isFinite(date.getTime()) ? date.toISOString() : "",
      observaciones: notes || null,
    });

    setError(
      result.success ? "" : (result.error.issues[0]?.message ?? "Revisa los datos de recepción."),
    );
    if (result.success) save.mutate(result.data);
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <legend className="mb-3 font-semibold">Registrar recepción</legend>
        <Select
          isDisabled={save.isPending}
          value={documentType}
          onChange={(value) => {
            if (typeof value === "string") setDocumentType(value);
          }}
        >
          <Label>Tipo de documento</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="Tipos de documento">
              {receptionDocuments.map((value) => (
                <ListBox.Item key={value} id={value} textValue={value}>
                  {value}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        {[
          ["documento", "Número de documento", 100],
          ["transportista", "Transportista", 150],
          ["placa", "Placa", 20],
        ].map(([name, label, max]) => (
          <TextField key={name} isRequired={name === "documento"} name={String(name)}>
            <Label>{label}</Label>
            <Input maxLength={Number(max)} />
          </TextField>
        ))}
        <TextField isRequired name="peso_recibido_kg" type="number">
          <Label>Peso recibido (kg)</Label>
          <Input max={99999999.99} min={0.01} step="0.01" />
        </TextField>
        <TextField isRequired name="recibido_en" type="datetime-local">
          <Label>Fecha y hora de recepción (hora local)</Label>
          <Input />
        </TextField>
        <TextField className="sm:col-span-2" name="observaciones">
          <Label>Observaciones</Label>
          <TextArea className="w-full" maxLength={3000} rows={3} />
        </TextField>
      </fieldset>
      {error || save.error ? <p role="alert">{error || save.error?.message}</p> : null}
      <Button isDisabled={save.isPending} type="submit" variant="primary">
        {save.isPending ? "Guardando…" : "Registrar recepción"}
      </Button>
    </form>
  );
}
