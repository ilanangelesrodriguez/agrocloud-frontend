import { z } from "zod";
import {
  detectionValidation,
  manualFinding,
  qualityDecision,
} from "@/features/agricultural/inspection";

export const detectionInput = z.object({
  confirmada: z.boolean(),
  observaciones: z.string().trim().max(2000).nullable(),
});
export const reasonInput = z.object({
  motivo: z.string().trim().min(1, "Describe el motivo.").max(2000),
});
export const reviewInput = z.object({
  revision_completa: z.literal(true),
  imagen_pertinente: z.literal(true),
  justificacion: z.string().trim().max(2000).nullable(),
});
export const findingNatures = [
  "ORGANISMO",
  "ENFERMEDAD",
  "DANO_PLAGA",
  "DEFECTO_FISICO",
  "OTRO",
] as const;
export const findingInput = z.object({
  id_evidencia: z.number().int().positive(),
  clase: z.string().trim().min(1).max(150),
  naturaleza: z.enum(findingNatures),
  observaciones: z.string().trim().min(1, "Documenta el hallazgo.").max(2000),
});
export const inspectionValidationInput = z.object({
  observaciones: z.string().trim().max(3000).nullable(),
});
export const decisionInput = z
  .object({
    decision: z.enum(["APROBADO", "OBSERVADO", "RECHAZADO"]),
    tipo_observacion: z
      .enum(["REINSPECCION", "DOCUMENTACION", "CORRECCION_ADMINISTRATIVA"])
      .nullable(),
    dictamen_anterior: z.number().int().positive().optional(),
    respuesta_observacion: z.string().trim().max(3000).nullable(),
    categoria: z.string().trim().max(100).nullable(),
    motivo: z.string().trim().max(200).nullable(),
    observaciones: z.string().trim().min(1, "Documenta el dictamen.").max(3000),
    protocolo_calidad: z.string().trim().min(1, "Indica el protocolo de calidad.").max(200),
    revision_independiente: z.literal(true),
  })
  .refine(
    (value) => value.decision !== "OBSERVADO" || value.tipo_observacion !== null,
    "Selecciona el tipo de observación.",
  )
  .refine(
    (value) => !value.dictamen_anterior || Boolean(value.respuesta_observacion),
    "Documenta la respuesta a la observación anterior.",
  );
export const detectionResponse = z.object({ data: detectionValidation });
export const findingResponse = z.object({ data: manualFinding });
export const decisionResponse = z.object({ data: qualityDecision });
