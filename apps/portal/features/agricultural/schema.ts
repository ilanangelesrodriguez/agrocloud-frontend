import { z } from "zod";

import { samplingRecord } from "./sampling";

const id = z.number().int().positive();
const text = (max: number) => z.string().trim().max(max).nullable();

export const producerInput = z.object({
  ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos."),
  nombre_razon_social: z.string().trim().min(1).max(200),
  fundo: text(200),
  ubicacion: text(250),
  departamento: text(100),
  provincia: text(100),
  distrito: text(100),
  ubigeo: z
    .string()
    .regex(/^\d{6}$/)
    .nullable(),
});
const producer = producerInput
  .partial()
  .required({ ruc: true, nombre_razon_social: true })
  .extend({
    id_productor: id,
    sunat_verificacion: z
      .object({
        resultado: z.string().nullish(),
        estado: z.string().nullish(),
        condicion: z.string().nullish(),
      })
      .nullish(),
  });

export const lotInput = z.object({
  id_productor: id,
  codigo_lote: z.string().trim().min(1).max(50),
  producto: z.string().min(1).max(150),
  variedad: text(150),
  unidad_medida: z.string().min(1).max(40),
  peso_kg: z.number().min(0.00001).max(99999999999),
  fecha_llegada_prevista: z.iso.datetime({ offset: true }),
});
export const receptionDocuments = [
  "Guía de remisión",
  "Comprobante interno",
  "Factura",
  "Otro",
] as const;
export const receptionInput = z.object({
  tipo_documento: z.enum(receptionDocuments),
  documento: z.string().trim().min(1).max(100),
  transportista: text(150),
  placa: text(20),
  peso_recibido_kg: z.number().min(0.01).max(99999999.99),
  recibido_en: z.iso.datetime({ offset: true }),
  observaciones: text(3000),
});
const reception = receptionInput.extend({
  tipo_documento: z.string(),
  peso_recibido_kg: z.union([z.string(), z.number()]),
});

export const receptionResponse = z.object({ data: reception });
export const traceabilityResponse = z.object({
  data: z.array(z.object({ id, evento: z.string(), created_at: z.string().nullish() })),
  last_page: id,
});
const lot = z.object({
  id_lote: id,
  codigo_lote: z.string(),
  id_productor: id,
  producto: z.string(),
  variedad: z.string().nullish(),
  estado: z.string(),
  peso_kg: z.union([z.string(), z.number()]),
  unidad_medida: z.string(),
  fecha_llegada_prevista: z.string(),
  productor: producer.nullish(),
  recepcion: reception.nullish(),
  muestreos: z.array(samplingRecord).optional(),
});
const meta = z.object({ current_page: id, last_page: id });

export const producerList = z.object({ data: z.array(producer), meta });
export const lotList = z.object({ data: z.array(lot), meta });
export const producerDetail = z.object({ data: producer });
export const lotDetail = z.object({ data: lot });
export const catalog = z.object({
  data: z.array(
    z.object({
      id,
      nombre: z.string(),
      parent_id: id.nullish(),
      id_empresa: id.nullish(),
      habilitado: z.boolean().optional(),
    }),
  ),
});
export const catalogType = z.enum([
  "producto",
  "variedad",
  "unidad",
  "metodo",
  "defecto",
  "categoria",
  "motivo",
]);
export const operationKey = z.uuid();
export type Producer = z.infer<typeof producer>;
export type Lot = z.infer<typeof lot>;
