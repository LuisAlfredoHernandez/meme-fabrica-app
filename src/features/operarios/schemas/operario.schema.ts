import { z } from "zod";
import { MAQUINAS_LIST, USUARIO_ROL, USUARIO_STATUS } from "@/types";

export const usuarioSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(2, "El nombre es demasiado corto"),
    apellido: z.string().min(2, "El apellido es demasiado corto"),
    correo: z.email("Correo electrónico inválido"),
    rol: z.enum(USUARIO_ROL),
    estado: z.enum(USUARIO_STATUS),
});

export const habilidadMaquinariaSchema = z.object({
    maquina: z.enum(MAQUINAS_LIST),
    nivel_eficiencia: z.number().min(0).max(100).optional(),
});

export const operarioSchema = usuarioSchema.extend({
    habilidades: z.array(habilidadMaquinariaSchema)
        .min(1, "Selecciona al menos una máquina")
        .refine(
            (items) => new Set(items.map((i) => i.maquina)).size === items.length,
            { message: "No puede haber habilidades duplicadas para el mismo tipo de máquina." }
        ),
    maquina_actual_id: z.string().uuid("Debe ser un ID válido").nullable().optional().or(z.literal("").transform(() => null)),
    orden_actual_id: z.string().optional().nullable(),
});

export type OperarioFormData = z.infer<typeof operarioSchema>;