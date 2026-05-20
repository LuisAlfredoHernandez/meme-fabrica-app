import { z } from "zod";

export const ValidacionSchema = z.object({
    id: z.string(),
    operarioId: z.string(),
    operarioNombre: z.string(),
    ordenId: z.string(),
    maquinaId: z.string(),
    fechaReporte: z.string(),
    piezasReportadas: z.number().min(0),
    piezasValidadasBuenas: z.number().min(0).optional(),
    piezasValidadasDefectuosas: z.number().min(0).optional(),
    estado: z.enum(["pendiente", "validado", "rechazado"]),
});

export type ValidacionReporte = z.infer<typeof ValidacionSchema>;
