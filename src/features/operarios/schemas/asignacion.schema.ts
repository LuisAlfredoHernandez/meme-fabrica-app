import { z } from "zod";

export const asignacionSchema = z.object({
    id: z.string().optional(),
    orden_id: z.string().min(1, "Debe seleccionar una orden"),
    operario_id: z.string().min(1, "Debe seleccionar un operario"),
    tarea: z.string().min(2, "La descripción de la tarea debe tener al menos 2 caracteres"),
    piezas_requeridas: z.number().int().nonnegative("La cantidad de piezas debe ser mayor o igual a 0"),
    piezas_completadas: z.number().int().nonnegative().optional(),
    estado: z.enum(["pendiente", "en_proceso", "completada"]).optional(),
    notas: z.string().optional(),
});

export type AsignacionFormData = z.infer<typeof asignacionSchema>;
