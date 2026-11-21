"use client";

import type { AccessRequest } from "../schema";

import Link from "next/link";
import { useState } from "react";
import { Button, Input, Label, TextArea, TextField } from "@heroui/react";
import { FiBriefcase, FiEye, FiExternalLink } from "react-icons/fi";
import { CreationDrawer } from "@/components/creation-drawer";
import { StatusBadge } from "@agrocloud/ui";

import { requestTone } from "../status";

import { DecisionForm } from "./decision-form";

const readOnlyClass =
  "w-full cursor-default border border-accent/25 bg-accent/10 text-foreground shadow-none caret-transparent focus:!border-accent/25 focus:!outline-none focus:!ring-0 focus-visible:!border-accent/25 focus-visible:!outline-none focus-visible:!ring-0";

type Field = {
  label: string;
  value?: string | null;
  long?: boolean;
};

export function RequestDetails({ request }: { request: AccessRequest }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const verification = request.sunat_verificacion;
  const fields: Field[] = [
    { label: "Nombre comercial", value: request.nombre_comercial },
    { label: "Tipo de empresa", value: request.tipo_empresa },
    {
      label: "Representante",
      value: [request.nombre, request.apellido].filter(Boolean).join(" "),
    },
    { label: "Correo", value: request.correo },
    { label: "Teléfono", value: request.telefono },
    {
      label: "Verificación tributaria",
      value: verification
        ? [verification.resultado, verification.estado, verification.condicion]
            .filter(Boolean)
            .join(" · ")
        : "Sin resultado registrado",
    },
    { label: "Uso previsto", value: request.uso, long: true },
    { label: "Motivo de la última decisión", value: request.motivo, long: true },
  ];

  return (
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span className="rounded-xl bg-accent/10 p-3 text-accent">
          <FiBriefcase aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold">{request.razon_social}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">RUC {request.ruc}</span>
            <StatusBadge tone={requestTone(request.estado)}>
              {request.estado.replaceAll("_", " ")}
            </StatusBadge>
          </div>
        </div>
      </div>
      <CreationDrawer
        open={open}
        onOpenChange={setOpen}
        busy={busy}
        title="Solicitud empresarial"
        description={request.razon_social}
        closeLabel="Cerrar"
        trigger={
          <Button variant="secondary" onPress={() => setOpen(true)}>
            <FiEye aria-hidden="true" /> Ver solicitud
          </Button>
        }
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="font-mono text-sm">RUC {request.ruc}</p>
          <StatusBadge tone={requestTone(request.estado)}>
            {request.estado.replaceAll("_", " ")}
          </StatusBadge>
        </div>

        {/* Mismo espacio entre todos los campos: 24 px entre columnas y 20 px entre filas */}
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {fields.map((field) =>
            field.value ? (
              <TextField
                key={field.label}
                isReadOnly
                className={field.long ? "min-w-0 sm:col-span-2" : "min-w-0"}
                value={field.value}
              >
                <Label className="text-sm font-medium">{field.label}</Label>
                {field.long ? (
                  <TextArea className={`${readOnlyClass} resize-none`} rows={3} tabIndex={-1} />
                ) : (
                  <Input className={readOnlyClass} tabIndex={-1} />
                )}
              </TextField>
            ) : null,
          )}
        </div>

        {request.id_empresa ? (
          <Link
            className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-accent hover:bg-default"
            href={"/admin/companies/" + request.id_empresa}
          >
            <FiExternalLink aria-hidden="true" /> Ver empresa
          </Link>
        ) : null}
        {request.estado === "APROBADA" || request.estado === "RECHAZADA" ? null : (
          <DecisionForm id={request.id} onBusyChange={setBusy} />
        )}
      </CreationDrawer>
    </article>
  );
}
