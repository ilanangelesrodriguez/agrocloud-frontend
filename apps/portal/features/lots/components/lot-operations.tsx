"use client";

import type { Lot } from "../schema";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { ReceptionForm } from "@/features/receptions/components/reception-form";
import { SamplingForm } from "@/features/samplings/components/sampling-form";
import { Traceability } from "@/features/traceability/components/traceability";

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
      <section
        id="lot-reception"
        className="scroll-mt-24 space-y-3 rounded-card border border-border bg-surface p-5"
      >
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
      <section
        id="lot-sampling"
        className="scroll-mt-24 space-y-2 rounded-card border border-border bg-surface p-5"
      >
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
