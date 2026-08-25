import { z } from "zod";

export const insumoSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El nombre es requerido"),
    codigo: z.string().optional(),
    tipo: z.enum(["tela", "accesorio", "zipper", "goma", "boton", "hilo", "otro"]),
    unidad: z.enum(["metros", "unidades", "rollos", "kg"]),
    stock: z.number().min(0, "El stock no puede ser negativo"),
    minimo: z.number().min(0, "El stock mínimo no puede ser negativo"),
    proveedor: z.string().optional(),
    vinculadoA: z.array(z.string()).optional(),
});

export type InsumoFormData = z.infer<typeof insumoSchema>;

export const ajusteInsumoSchema = z.object({
    cantidad_ajuste: z.number().refine(val => val !== 0, {
        message: "La cantidad no puede ser 0"
    }),
    justificacion: z.string().min(3, "Debe proveer una justificación clara para este ajuste"),
});

export type AjusteInsumoFormData = z.infer<typeof ajusteInsumoSchema>;