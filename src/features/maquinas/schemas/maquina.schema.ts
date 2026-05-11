import { z } from 'zod';
import { MAQUINAS_STATUS_LIST, MAQUINAS_LIST } from "@/types";

export const maquinaSchema = z.object({
    id: z.string().optional(),
    codigo: z.string().min(1, "El código es obligatorio"),
    tipo: z.enum(MAQUINAS_LIST),
    nombre: z.string().min(2, "El nombre debe ser más descriptivo"),
    descripcion: z.string().optional(),
    modelo: z.string().optional(),
    serie: z.string().optional(),
    capacidadPorHora: z.number().nonnegative("La capacidad debe ser un número positivo"),
    operarioAsignado: z.string().optional(),
    estado: z.enum(MAQUINAS_STATUS_LIST),
    ultimoMantenimiento: z.string().optional(),
    horasUso: z.number().min(0, "Las horas de uso no pueden ser negativas"),
    ubicacion: z.string().optional(),
});

export type MaquinaFormData = z.infer<typeof maquinaSchema>;