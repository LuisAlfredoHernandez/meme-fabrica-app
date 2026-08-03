import { ESTADO_ORDEN_LIST, PRIORIDAD_LIST, TEMPORADA_LIST, TipoOP_LIST, TipoProducto } from "@/types";
import { z } from "zod";


const insumoSchema = z.object({
    insumoId: z.string(),
    cantidadRequerida: z.number().positive("La cantidad debe ser mayor a 0"),
    unidad: z.string(),
});

export const lineaOrdenSchema = z.object({
    id: z.string().optional(),
    productoTipo: z.custom<TipoProducto>().optional(),
    descripcion: z.string().min(2, "Debe seleccionar o escribir una prenda"),
    cantidad: z.number().int().positive("La cantidad de prendas debe ser mayor a 0"),
    cantidadCompletada: z.number().optional(),
    talla: z.string(),
    color: z.string().optional(),
    insumos: z.array(insumoSchema).min(1, "Debe incluir al menos un insumo (ej. tela, hilos)"),
});

export const asignacionCreateSchema = z.object({
    id: z.string().optional(),
    operario_id: z.string().uuid("ID de operario inválido"),
    tarea: z.string().min(2, "La tarea debe tener al menos 2 caracteres"),
    piezas_requeridas: z.number().int().positive("La cantidad debe ser mayor a 0"),
    notas: z.string().optional(),
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
    lineas: z.array(lineaOrdenSchema).min(1, "Debe haber al menos una línea"),
    asignaciones: z.array(asignacionCreateSchema).optional(),
});

export type OrdenFormData = z.infer<typeof ordenSchema>;
export type LineaOrden = z.infer<typeof lineaOrdenSchema>;