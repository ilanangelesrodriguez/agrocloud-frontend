import { z } from "zod";

const id = z.number().int().positive();

export const detectionValidation = z.object({
  id_validacion: id,
  indice_deteccion: z.number().int().nonnegative(),
  confirmada: z.boolean(),
  observaciones: z.string().nullish(),
  detection_id: z.string().optional(),
});
export const aiDetection = z.object({
  id: z.string(),
  class_name: z.string(),
  confidence: z.number().min(0).max(1),
  box: z.object({ x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number() }),
});
export const manualFinding = z.object({
  id_hallazgo: id,
  id_evidencia: id,
  clase: z.string(),
  naturaleza: z.string(),
  observaciones: z.string(),
});
export const qualityDecision = z.object({
  id_dictamen: id,
  decision: z.string(),
  tipo_observacion: z.string().nullish(),
  categoria: z.string().nullish(),
  motivo: z.string().nullish(),
  observaciones: z.string().nullish(),
  protocolo_calidad: z.string().nullish(),
  respuesta_observacion: z.string().nullish(),
  created_at: z.string().nullish(),
});

export const evidence = z.object({
  id_evidencia: id,
  id_fruto: id,
  estado_ia: z.string().nullish(),
  pertinencia: z.string().nullish(),
  error_ia: z.string().nullish(),
  version_modelo: z.string().nullish(),
  reviewed_at: z.string().nullish(),
  resultado_ia: z
    .object({ model_id: z.string().optional(), detections: z.array(aiDetection) })
    .nullish(),
  validaciones: z.array(detectionValidation).optional(),
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
  data: z.array(
    z.object({
      id,
      numero: id,
      codigo: z.string().nullish(),
    }),
  ),
  meta: z.object({ current_page: id, last_page: id }),
});
export const inspectionDetail = z.object({
  data: inspection.extend({
    observaciones: z.string().nullish(),
    evidencias: z.array(evidence).optional(),
    hallazgos: z.array(manualFinding).optional(),
    dictamenes: z.array(qualityDecision).optional(),
    muestreo: sample.omit({ inspecciones: true }).optional(),
  }),
});
export const inspectionCreated = z.object({ data: inspection });
