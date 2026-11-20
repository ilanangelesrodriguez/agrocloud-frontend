import { z } from "zod";
import { catalog, catalogType } from "@/features/agricultural/schema";
import { procedureRecord } from "@/features/agricultural/sampling";

export const catalogLabels = {
  producto: "Productos",
  variedad: "Variedades",
  unidad: "Unidades de medida",
  metodo: "Métodos de muestreo",
  defecto: "Defectos",
  categoria: "Categorías comerciales",
  motivo: "Motivos de rechazo",
} as const;
export type CatalogType = z.infer<typeof catalogType>;
export type CatalogItem = z.infer<typeof catalog>["data"][number];
export type Procedure = z.infer<typeof procedureRecord>;
export const catalogInput = z
  .object({
    tipo: z.enum(["producto", "variedad", "metodo", "defecto", "categoria", "motivo"]),
    nombre: z.string().trim().min(1, "Ingresa un nombre.").max(150),
    parent_id: z.number().int().positive().nullable(),
  })
  .refine(
    (value) => (value.tipo === "variedad" ? value.parent_id !== null : value.parent_id === null),
    {
      message: "Selecciona el producto de la variedad.",
      path: ["parent_id"],
    },
  );
export const procedureInput = z
  .object({
    producto_id: z.number().int().positive().nullish(),
    metodo_id: z.number().int().positive().optional(),
    nombre: z.string().trim().min(1, "Ingresa un nombre.").max(150),
    version: z.string().trim().min(1, "Ingresa la versión.").max(30),
    metodo: z.string().trim().min(1, "Selecciona un método.").max(80),
    producto: z.string().trim().min(1).max(150).nullable(),
    criterio_muestra: z.string().trim().min(1, "Describe el criterio de muestra.").max(1500),
    seleccion_frutos: z.string().trim().min(1, "Describe la selección de frutos.").max(1500),
    tamano_recomendado: z.number().int().positive().nullable(),
    max_frutos: z.number().int().min(1).max(100000),
    requiere_poblacion: z.boolean(),
  })
  .refine(
    (value) => value.tamano_recomendado === null || value.tamano_recomendado <= value.max_frutos,
    {
      message: "El tamaño recomendado no puede superar el máximo de frutos.",
      path: ["tamano_recomendado"],
    },
  );
export const procedureResponse = z.object({ data: procedureRecord });
// Eloquent no hidrata los defaults de la base al devolver un modelo recién creado.
export const procedureCreated = z.object({
  data: procedureRecord.extend({ activo: z.boolean().default(true) }),
});
export const catalogCreated = z.object({ data: catalog.shape.data.element });
export const catalogUpdated = z.object({ updated: z.literal(true) });
export const catalogToggle = z.object({ estado: z.boolean() });
export const procedureToggle = z.object({ activo: z.boolean() });
