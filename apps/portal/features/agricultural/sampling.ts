import { z } from "zod";

const id = z.number().int().positive();

export const procedureRecord = z.object({
  id,
  nombre: z.string(),
  version: z.union([z.string(), z.number()]),
  metodo: z.string(),
  producto: z.string().nullish(),
  activo: z.boolean(),
  requiere_poblacion: z.boolean(),
  max_frutos: id,
  tamano_recomendado: id.nullish(),
  criterio_muestra: z.string(),
  seleccion_frutos: z.string(),
});
export const procedurePage = z.object({
  data: z.array(procedureRecord),
  meta: z.object({ last_page: id }),
});
export const samplingInput = z.object({
  procedure_id: id,
  tamano_muestra: id,
  poblacion_estimada: id.max(100000000).optional(),
  fuente_poblacion: z.string().trim().max(500).optional(),
  motivo_desviacion: z.string().trim().max(1500).optional(),
  confirmar_instrucciones: z.literal(true),
  confirmar_carga: z.literal(true).optional(),
  observaciones: z.string().trim().max(3000).optional(),
});
export const samplingRecord = z.object({
  id_muestreo: id,
  estado: z.string().optional(),
  metodo: z.string().optional(),
  tamano_muestra: id.optional(),
});
export const samplingResponse = z.object({ data: samplingRecord });
