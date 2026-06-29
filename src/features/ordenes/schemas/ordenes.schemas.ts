import { ESTADO_ORDEN_LIST, PRIORIDAD_LIST, TEMPORADA_LIST, TipoOP_LIST, TipoProducto } from "@/types";
import { z } from "zod";


const insumoSchema = z.object({
    insumoId: z.string(),
    cantidadRequerida: z.number(),
    unidad: z.string(),
});

export const lineaOrdenSchema = z.object({
    productoTipo: z.custom<TipoProducto>().optional(),
    descripcion: z.string(),
    cantidad: z.number(),
    cantidadCompletada: z.number().optional(),
    talla: z.string(),
    color: z.string().optional(),
    insumos: z.array(insumoSchema).optional(),
});

export const ordenSchema = z.object({
    id: z.string().optional(),
    numero: z.string().optional(),
    cliente: z.string().min(2, "Nombre de cliente inválido"),
    tipo: z.enum(TipoOP_LIST),
    estado: z.enum(ESTADO_ORDEN_LIST).optional(),
    temporada: z.enum(TEMPORADA_LIST).optional(),
    prioridad: z.enum(PRIORIDAD_LIST),
    fechaCreacion: z.string().optional(),
    fechaEntregaEstimada: z.string().min(10, "La fecha de entrega es obligatoria"),
    fechaEntregaPredicha: z.string().datetime().optional(),
    fechaEntregaReal: z.string().datetime().optional(),
    creadaPor: z.string().optional(),
    notas: z.string().optional(),
    cola: z.number().int().nonnegative().optional(),
    lineas: z.array(lineaOrdenSchema).min(1, "Debe haber al menos una línea"),
});

export type OrdenFormData = z.infer<typeof ordenSchema>;
export type LineaOrden = z.infer<typeof lineaOrdenSchema>;