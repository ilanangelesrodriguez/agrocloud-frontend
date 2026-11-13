"use client";

import type { AccessRequest } from "../schema";
import Link from "next/link";
import { StatusBadge } from "@agrocloud/ui";
import { DecisionForm } from "./decision-form";
import { requestTone } from "../status";

export function RequestDetails({ request }: { request: AccessRequest }) {
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
    <details className="rounded-card border border-border bg-surface p-4">
      <summary className="cursor-pointer">
        <strong>{request.razon_social}</strong>
        <span className="ml-2 text-sm text-muted">
          {request.ruc} ·{" "}
          <StatusBadge tone={requestTone(request.estado)}>
            {request.estado.replaceAll("_", " ")}
          </StatusBadge>
        </span>
      </summary>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, value]) =>
          value ? (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="whitespace-pre-wrap break-words">{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
      {request.id_empresa ? (
        <Link
          className="mt-4 inline-block text-accent underline"
          href={"/admin/companies/" + request.id_empresa}
        >
          Ver empresa
        </Link>
      ) : null}
      {request.estado === "APROBADA" || request.estado === "RECHAZADA" ? null : (
        <DecisionForm id={request.id} />
      )}
    </details>
  );
}
