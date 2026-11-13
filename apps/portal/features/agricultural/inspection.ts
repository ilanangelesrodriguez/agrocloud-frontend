import { z } from "zod";

const id = z.number().int().positive();
export const evidence = z.object({
  id_evidencia: id, id_fruto: id, estado_ia: z.string().nullish(), pertinencia: z.string().nullish(),
});
export const evidenceResponse = z.object({ data: evidence });
export const analysisQueued = z.object({ queued: z.literal(true) });
export const evidenceTypes = ["image/jpeg", "image/png", "image/webp"];
export const evidenceMaxBytes = 3 * 1024 * 1024;
const inspection = z.object({
  id_inspeccion: id,
  id_muestreo: id,
  estado: z.string(),
  id_inspector: id.nullish(),
  validada_en: z.string().nullish(),
});
const sample = z.object({
  id_muestreo: id,
  id_lote: id,
  estado: z.string(),
  metodo: z.string().nullish(),
  tamano_muestra: id,
  inspecciones: z.array(inspection).optional(),
  lote: z.object({ id_lote: id, codigo_lote: z.string() }).optional(),
});
export const samplingDetail = z.object({ data: sample });
export const samplingFruits = z.object({
  data: z.array(z.object({
    id,
    numero: id,
    codigo: z.string().nullish(),
  })),
  meta: z.object({ current_page: id, last_page: id }),
});
export const inspectionDetail = z.object({
  data: inspection.extend({
    observaciones: z.string().nullish(),
    evidencias: z.array(evidence).optional(),
    hallazgos: z.array(z.object({ id_hallazgo: id })).optional(),
    dictamenes: z.array(z.object({ id_dictamen: id, decision: z.string().nullish() })).optional(),
    muestreo: sample.omit({ inspecciones: true }).optional(),
  }),
});
export const inspectionCreated = z.object({ data: inspection });
