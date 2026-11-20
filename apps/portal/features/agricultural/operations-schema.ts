import { z } from "zod";
import { lotList } from "./schema";
const id = z.number().int().positive();
const meta = z.object({ current_page: id, last_page: id });
const lot = z.object({ id_lote: id, codigo_lote: z.string(), producto: z.string().optional() });
export const samplingsPage = z.object({
  data: z.array(
    z.object({
      id_muestreo: id,
      id_lote: id,
      estado: z.string(),
      metodo: z.string(),
      tamano_muestra: id,
      lote: lot.optional(),
    }),
  ),
  meta,
});
export const inspectionsPage = z.object({
  data: z.array(
    z.object({
      id_inspeccion: id,
      id_muestreo: id,
      estado: z.string(),
      muestreo: z.object({ id_lote: id, lote: lot.optional() }).optional(),
    }),
  ),
  meta,
});
export const incidentRecord = z.object({
  id,
  id_lote: id,
  titulo: z.string(),
  descripcion: z.string(),
  gravedad: z.enum(["BAJA", "MEDIA", "ALTA", "CRITICA"]),
  estado: z.enum(["ABIERTA", "EN_ATENCION", "RESUELTA", "CERRADA"]),
  responsable: z.coerce.number().int().positive(),
});
export const incidentsPage = z.object({ data: z.array(incidentRecord), meta });
export const incidentResponse = z.object({ data: incidentRecord });
export const incidentInput = z.object({
  titulo: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().min(1).max(3000),
  gravedad: incidentRecord.shape.gravedad,
  responsable: id,
});
export const incidentUpdate = z
  .object({
    estado: incidentRecord.shape.estado,
    accion: z.string().trim().min(1).max(3000),
    comprobacion: z.string().trim().max(1500).optional(),
    evidencia: id.optional(),
  })
  .refine(
    (value) => !["RESUELTA", "CERRADA"].includes(value.estado) || Boolean(value.comprobacion),
    { message: "Documenta la comprobación para resolver o cerrar.", path: ["comprobacion"] },
  );
export const cancelInput = z.object({ motivo: z.string().trim().min(1).max(2000) });
export const cancelResponse = z.object({ cancelled: z.literal(true) });
const count = z.object({ estado: z.string(), total: z.coerce.number().int().nonnegative() });
export const reportSummary = z.object({
  lots_by_status: z.array(count),
  inspections_by_status: z.array(count),
  open_critical_incidents: z.number().int().nonnegative(),
});
export { lotList };
