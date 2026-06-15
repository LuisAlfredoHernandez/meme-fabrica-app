import { z } from "zod";
import { MAQUINAS_LIST, USUARIO_ROL, USUARIO_STATUS } from "@/types";

export const usuarioSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(2, "El nombre es demasiado corto"),
    apellido: z.string().min(2, "El apellido es demasiado corto"),
    correo: z.email("Correo electrónico inválido"),
    rol: z.enum(USUARIO_ROL),
    estado: z.enum(USUARIO_STATUS),
    password: z.string().optional(), // Opcional para ediciones
});

export const habilidadMaquinariaSchema = z.object({
    maquina: z.enum(MAQUINAS_LIST),
    nivelEficiencia: z.number().min(0).max(100),
    unidadesProducidas: z.number().min(0).nullish(),
    unidadesDefectuosas: z.number().min(0).nullish(),
});

export const operarioSchema = usuarioSchema.extend({
    habilidades: z.array(habilidadMaquinariaSchema).min(1, "Selecciona al menos una máquina"),
    maquinaActual: z.enum(MAQUINAS_LIST).optional(),
    ordenActual: z.string().nullish(),
    fechaDeOrden: z.string().nullish(),
});

export type OperarioFormData = z.infer<typeof operarioSchema>;