import { ValidacionReporte } from "../schemas/validacion.schema";

// Datos en memoria para simular el backend
const mockValidaciones: ValidacionReporte[] = [
    {
        id: "val-1",
        operarioId: "e1",
        operarioNombre: "Carmen Méndez",
        ordenId: "ORD-2026-0042",
        maquinaId: "merrow",
        fechaReporte: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Hace 30 minutos
        piezasReportadas: 50,
        estado: "pendiente",
    },
    {
        id: "val-2",
        operarioId: "e2",
        operarioNombre: "Josué Reyes",
        ordenId: "ORD-2026-0042",
        maquinaId: "cover",
        fechaReporte: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // Hace 1 hora
        piezasReportadas: 100,
        estado: "pendiente",
    },
    {
        id: "val-3",
        operarioId: "e3",
        operarioNombre: "María Santos",
        ordenId: "ORD-2026-0043",
        maquinaId: "corte",
        fechaReporte: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // Hace 2 horas
        piezasReportadas: 300,
        estado: "pendiente",
    }
];

export const validacionService = {
    async getPendientes(): Promise<ValidacionReporte[]> {
        // Simular latencia de red
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockValidaciones.filter(v => v.estado === "pendiente");
    },

    async validarReporte(id: string, buenas: number, defectuosas: number): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockValidaciones.findIndex(v => v.id === id);
        if (index === -1) return false;

        mockValidaciones[index] = {
            ...mockValidaciones[index],
            estado: "validado",
            piezasValidadasBuenas: buenas,
            piezasValidadasDefectuosas: defectuosas
        };
        return true;
    }
};