import { z } from "zod";
import { MAQUINAS_LIST, ROLSUSUARIO, STATUS } from "@/types";

// 1. Esquema base que coincide con la interface Usuario
export const usuarioSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(2, "El nombre es demasiado corto"),
    apellido: z.string().min(2, "El apellido es demasiado corto"),
    correo: z.email("Correo electrónico inválido"),
    rol: z.enum(ROLSUSUARIO),
    estado: z.enum(STATUS),
    password: z.string().optional().nullish(), // Opcional para ediciones
});

// 2. Esquema de Habilidad (coincide con HabilidadMaquinaria)
export const habilidadMaquinariaSchema = z.object({
    maquina: z.enum(MAQUINAS_LIST),
    nivelEficiencia: z.number().min(0).max(100),
});

// 3. Esquema de Operario (Extiende de Usuario)
export const operarioSchema = usuarioSchema.extend({
    habilidades: z.array(habilidadMaquinariaSchema).min(1, "Selecciona al menos una máquina"),
    maquinaActual: z.enum(MAQUINAS_LIST).optional(),
    ordenActual: z.string().optional(),
});

// Esto genera el tipo automáticamente a partir del esquema
export type OperarioFormData = z.infer<typeof operarioSchema>;