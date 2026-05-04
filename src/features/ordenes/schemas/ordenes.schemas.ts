import { ESTADO_ORDEN_LIST, PRIORIDAD_LIST, TEMPORADA_LIST, TipoOP_LIST, TipoProducto } from "@/types";
import { z } from "zod";


const insumoSchema = z.object({
    insumoId: z.string(),
    cantidadRequerida: z.number(),
    unidad: z.string(),
});

export const lineaOrdenSchema = z.object({
    productoTipo: z.custom<TipoProducto>(),
    descripcion: z.string(),
    cantidad: z.number(),
    cantidadCompletada: z.number(),
    talla: z.string().optional(),
    color: z.string().optional(),
    insumos: z.array(insumoSchema),
});

export const ordenSchema = z.object({
    id: z.string().optional(), // Opcional porque en creación no existe
    numero: z.string().min(1, "El número de orden es obligatorio"),
    cliente: z.string().min(2, "Nombre de cliente inválido"),
    tipo: z.enum(TipoOP_LIST),
    estado: z.enum(ESTADO_ORDEN_LIST),
    temporada: z.enum(TEMPORADA_LIST),
    prioridad: z.enum(PRIORIDAD_LIST),
    fechaCreacion: z.string().datetime().optional(),
    fechaEntregaEstimada: z.string().datetime({ message: "Fecha de entrega requerida" }),
    fechaEntregaPredicha: z.string().datetime().optional(),
    fechaEntregaReal: z.string().datetime().optional(),
    creadaPor: z.string().min(1),
    notas: z.string().optional(),
    cola: z.number().int().nonnegative().optional(),
    // Si manejas las líneas dentro del mismo form:
    lineas: z.array(lineaOrdenSchema).min(1, "Debe haber al menos una línea"),
});

export type OrdenFormData = z.infer<typeof ordenSchema>;
export type LineaOrden = z.infer<typeof lineaOrdenSchema>;