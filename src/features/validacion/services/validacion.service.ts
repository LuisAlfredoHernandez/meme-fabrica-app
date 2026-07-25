import { ValidacionReporte } from "../schemas/validacion.schema";

const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const validacionService = {
    async getPendientes(token?: string): Promise<ValidacionReporte[]> {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${API_URL}/reportes-avance/pendientes`, {
                method: "GET",
                headers: getAuthHeaders(token),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("[validacionService.getPendientes] Error response:", response.status, errText);
                throw new Error("No se pudieron obtener los reportes pendientes.");
            }
            const data = await response.json();
            return data.map((item: any) => ({
                id: item.id,
                operarioId: item.operario_id,
                operarioNombre: item.operario_nombre,
                ordenId: item.orden_id,
                maquinaId: item.maquina_id || "Desconocida",
                fechaReporte: item.fecha_reporte,
                piezasReportadas: item.piezas_reportadas,
                piezasValidadasBuenas: item.piezas_buenas,
                piezasValidadasDefectuosas: item.piezas_defectuosas,
                estado: item.estado,
                fechaInicio: item.fecha_inicio,
                fechaFin: item.fecha_fin,
            }));
        } catch (error) {
            console.error("Error en validacionService.getPendientes:", error);
            throw error;
        }
    },

    async validarReporte(id: string, buenas: number, defectuosas: number, fechaInicio?: string | null, fechaFin?: string | null, token?: string): Promise<boolean> {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const payload: any = {
                piezas_buenas: buenas,
                piezas_defectuosas: defectuosas,
                estado: "validado"
            };
            if (fechaInicio) payload.fecha_inicio = fechaInicio;
            if (fechaFin) payload.fecha_fin = fechaFin;
            
            const response = await fetch(`${API_URL}/reportes-avance/${id}/validar`, {
                method: "POST",
                headers: getAuthHeaders(token),
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`No se pudo validar el reporte con ID: ${id}`);
            return true;
        } catch (error) {
            console.error("Error en validacionService.validarReporte:", error);
            return false;
        }
    }
};