import { apiClient } from "@/shared/apiClient";

export interface DashboardDailyStat {
    d: string;
    real: number;
    meta: number;
    mto: number;
    mts: number;
    eficiencia: number;
}

export interface DashboardMachineStat {
    codigo: string;
    tipo: string;
    uso: number;
    estado: string;
    piezasHoy: number;
}

export interface DashboardOperatorStat {
    nombre: string;
    eficiencia: number;
    piezasHoy: number;
    estado: string;
}

export interface DashboardDistribucion {
    nombre: string;
    valor: number;
    color: string;
}

export interface DashboardStatsResponse {
    datos_semana: DashboardDailyStat[];
    maquinas_uso: DashboardMachineStat[];
    operarios_rendimiento: DashboardOperatorStat[];
    distribucion_maquinas: DashboardDistribucion[];
}

export const dashboardService = {
    getStats: async (token?: string): Promise<DashboardStatsResponse> => {
        const response = await apiClient.get("/dashboard/stats", { token });
        if (!response.ok) {
            throw new Error("No se pudieron obtener las estadísticas del dashboard.");
        }
        return response.json();
    }
};
