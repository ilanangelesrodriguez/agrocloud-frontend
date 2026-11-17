"use client";

import type { AccessRequest } from "../schema";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@heroui/react";
import { FiBriefcase, FiEye, FiExternalLink } from "react-icons/fi";
import { CreationDrawer } from "@/components/creation-drawer";
import { StatusBadge } from "@agrocloud/ui";

import { requestTone } from "../status";

import { DecisionForm } from "./decision-form";

export function RequestDetails({ request }: { request: AccessRequest }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const verification = request.sunat_verificacion;
  const fields = [
    ["Nombre comercial", request.nombre_comercial],
    ["Tipo de empresa", request.tipo_empresa],
    ["Representante", [request.nombre, request.apellido].filter(Boolean).join(" ")],
    ["Correo", request.correo],
    ["Teléfono", request.telefono],
    ["Uso previsto", request.uso],
    [
      "Verificación tributaria",
      verification
        ? [verification.resultado, verification.estado, verification.condicion]
            .filter(Boolean)
            .join(" · ")
        : "Sin resultado registrado",
    ],
    ["Motivo de la última decisión", request.motivo],
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
        <dl className="grid gap-5 sm:grid-cols-2">
          {fields.map(([label, value]) =>
            value ? (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-muted">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
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
