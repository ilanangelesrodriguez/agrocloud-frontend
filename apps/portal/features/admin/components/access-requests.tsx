"use client";

import type { FormEvent } from "react";
import type { AccessRequest } from "../schema";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, toast } from "@heroui/react";
import Link from "next/link";

import { adminRequest } from "../api";
import { decisionResponseSchema, decisionSchema, requestPageSchema } from "../schema";
import { AdminError, AdminHeading, AdminPagination } from "./admin-ui";

function DecisionForm({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState("EN_REVISION");
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (body: object) => adminRequest(
      "access-requests/" + id + "/decision",
      decisionResponseSchema,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    ),
    onSuccess: async ({ data }) => {
      toast.success("Decisión registrada");
      queryClient.setQueriesData<ReturnType<typeof requestPageSchema.parse>>(
        { queryKey: ["admin", "access-requests"] },
        (page) => page && { ...page, data: page.data.map((row) => row.id === id ? data : row) },
      );
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const fields = new FormData(event.currentTarget);
    const parsed = decisionSchema.safeParse({
      decision,
      motivo: fields.get("motivo"),
      revision_manual: decision === "APROBADA" && manual,
      referencia_verificacion: fields.get("referencia") || undefined,
    });

    setError(parsed.success ? "" : parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.");
    if (parsed.success) mutation.mutate(parsed.data);
  }

  return (
    <form className="mt-4 space-y-4 border-t border-border pt-4" onSubmit={submit}>
      <fieldset className="grid gap-3" disabled={mutation.isPending}>
        <legend className="mb-2 font-semibold">Registrar decisión</legend>
        <label className="grid gap-1">
          Decisión
          <select className="rounded-field border border-border bg-surface p-2" value={decision} onChange={(event) => setDecision(event.target.value)}>
            <option value="EN_REVISION">En revisión</option>
            <option value="APROBADA">Aprobar</option>
            <option value="RECHAZADA">Rechazar</option>
          </select>
        </label>
        {decision === "APROBADA" ? (
          <>
            <p className="text-sm text-muted">Identity verifica el RUC al aprobar. Si no confirma que esté activo y habido, debes justificar la revisión manual.</p>
            <label className="flex items-center gap-2">
              <input checked={manual} type="checkbox" onChange={(event) => setManual(event.target.checked)} />
              Confirmo que realicé una revisión manual
            </label>
            {manual ? (
              <label className="grid gap-1">
                Referencia de verificación (opcional)
                <input className="rounded-field border border-border bg-surface p-2" maxLength={255} name="referencia" />
              </label>
            ) : null}
          </>
        ) : null}
        <label className="grid gap-1">
          Motivo
          <textarea required className="rounded-field border border-border bg-surface p-2" maxLength={2000} minLength={decision === "APROBADA" && manual ? 20 : 1} name="motivo" rows={3} />
        </label>
      </fieldset>
      {error || mutation.error ? <p role="alert">{error || mutation.error?.message}</p> : null}
      <Button isDisabled={mutation.isPending} type="submit" variant="primary">
        {mutation.isPending ? "Guardando…" : "Guardar decisión"}
      </Button>
    </form>
  );
}

function RequestDetails({ request }: { request: AccessRequest }) {
  const verification = request.sunat_verificacion;
  const fields = [
    ["Nombre comercial", request.nombre_comercial],
    ["Tipo de empresa", request.tipo_empresa],
    ["Representante", [request.nombre, request.apellido].filter(Boolean).join(" ")],
    ["Correo", request.correo],
    ["Teléfono", request.telefono],
    ["Uso previsto", request.uso],
    ["Verificación tributaria", verification ? [verification.resultado, verification.estado, verification.condicion].filter(Boolean).join(" · ") : "Sin resultado registrado"],
    ["Motivo de la última decisión", request.motivo],
  ];

  return (
    <details className="rounded-card border border-border bg-surface p-4">
      <summary className="cursor-pointer">
        <strong>{request.razon_social}</strong>
        <span className="ml-2 text-sm text-muted">{request.ruc} · {request.estado.replaceAll("_", " ")}</span>
      </summary>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, value]) => value ? (
          <div key={label} className="min-w-0">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="whitespace-pre-wrap break-words">{value}</dd>
          </div>
        ) : null)}
      </dl>
      {request.id_empresa ? (
        <Link className="mt-4 inline-block text-accent underline" href={"/admin/companies/" + request.id_empresa}>Ver empresa</Link>
      ) : null}
      {request.estado === "APROBADA" || request.estado === "RECHAZADA" ? null : <DecisionForm id={request.id} />}
    </details>
  );
}

export function AccessRequests() {
  const [page, setPage] = useState(1);
  const requests = useQuery({
    queryKey: ["admin", "access-requests", page],
    queryFn: ({ signal }) => adminRequest("access-requests?page=" + page, requestPageSchema, { signal }),
    retry: false,
  });

  return (
    <section className="space-y-4">
      <AdminHeading title="Solicitudes empresariales" />
      {requests.isPending ? <p role="status">Cargando solicitudes…</p> : requests.isError ? (
        <AdminError error={requests.error} retry={() => { void requests.refetch(); }} />
      ) : (
        <>
          {requests.data.data.length ? requests.data.data.map((request) => (
            <RequestDetails key={request.id} request={request} />
          )) : <p>No hay solicitudes en esta página.</p>}
          <AdminPagination last={requests.data.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}
