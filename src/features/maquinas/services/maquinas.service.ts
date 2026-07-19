import { Maquina, TipoMaquina, MAQUINAS_LIST, ReporteAveria } from "@/types";

/**
 * Helper interno para obtener headers con autenticación de manera agnóstica.
 */
const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const mapApiToFrontend = (api: any): Maquina => {
  return {
    id: api.id,
    codigo: api.codigo,
    tipo: api.tipo,
    nombre: api.nombre,
    modelo: api.modelo || "",
    serie: api.serie || "",
    capacidadPorHora: api.capacidad_por_hora ?? 0,
    operarioAsignado: api.operario_asignado_id || undefined,
    estado: api.estado,
  };
};

export const mapFrontendToApi = (maquina: Partial<Maquina>): any => {
  const api: any = {};
  if (maquina.codigo !== undefined) api.codigo = maquina.codigo;
  if (maquina.tipo !== undefined) api.tipo = maquina.tipo;
  if (maquina.nombre !== undefined) api.nombre = maquina.nombre;
  if (maquina.modelo !== undefined) api.modelo = maquina.modelo;
  if (maquina.capacidadPorHora !== undefined) api.capacidad_por_hora = maquina.capacidadPorHora;
  if (maquina.estado !== undefined) api.estado = maquina.estado;
  if (maquina.operarioAsignado !== undefined) api.operario_asignado_id = maquina.operarioAsignado || null;
  return api;
};

export const maquinasService = {
  getAll: async (token?: string): Promise<Maquina[]> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/maquinas?_t=${timestamp}`, {
        method: "GET",
        headers: getAuthHeaders(token),
        cache: "no-store",
      });

      if (!response.ok) throw new Error("No se pudo obtener la lista de máquinas.");
      const data: any[] = await response.json();
      return data.map(mapApiToFrontend);
    } catch (error: any) {
      console.error("Error en maquinasService.getAll:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  getAllTypes: async (token?: string): Promise<TipoMaquina[]> => {
    // Los tipos usualmente son constantes, retornamos la constante desde types
    return [...MAQUINAS_LIST];
  },

  create: async (data: Omit<Maquina, "id">, token?: string): Promise<Maquina> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const mappedData = mapFrontendToApi(data);
      const response = await fetch(`${API_URL}/maquinas`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(mappedData),
      });

      if (!response.ok) throw new Error("No se pudo crear la máquina.");
      const created = await response.json();
      return mapApiToFrontend(created);
    } catch (error: any) {
      console.error("Error en maquinasService.create:", error);
      throw new Error(error.message || "Error al crear la máquina.");
    }
  },

  update: async (id: string, data: Partial<Maquina>, token?: string): Promise<Maquina> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const mappedData = mapFrontendToApi(data);
      const response = await fetch(`${API_URL}/maquinas/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify(mappedData),
      });

      if (!response.ok) throw new Error(`No se pudo actualizar la máquina con ID: ${id}`);
      const updated = await response.json();
      return mapApiToFrontend(updated);
    } catch (error: any) {
      console.error("Error en maquinasService.update:", error);
      throw new Error(error.message || "Error al actualizar la máquina.");
    }
  },

  reportarAveria: async (data: Omit<ReporteAveria, "id" | "fecha_reporte" | "estado">, token?: string): Promise<ReporteAveria> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/reportes-averia`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errMsg = "No se pudo enviar el reporte de avería.";
        try {
          const errData = await response.json();
          if (errData.detail) {
            errMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (e) {}
        console.error("[maquinasService.reportarAveria] HTTP Error:", response.status, errMsg);
        throw new Error(errMsg);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error en maquinasService.reportarAveria:", error);
      throw new Error(error.message || "Error al enviar el reporte de avería.");
    }
  },

  getReportesAveriaPendientes: async (token?: string): Promise<ReporteAveria[]> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/reportes-averia/pendientes?_t=${timestamp}`, {
        method: "GET",
        headers: getAuthHeaders(token),
        cache: "no-store",
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error("[maquinasService.getReportesAveriaPendientes] HTTP Error:", response.status, errText);
        throw new Error("No se pudieron obtener los reportes de avería pendientes.");
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error en maquinasService.getReportesAveriaPendientes:", error);
      return [];
    }
  },

  procesarReporteAveria: async (id: string, aprobado: boolean, notas?: string, token?: string): Promise<ReporteAveria> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/reportes-averia/${id}/procesar`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ aprobado, notas }),
      });

      if (!response.ok) {
        let errMsg = "No se pudo procesar el reporte de avería.";
        try {
          const errData = await response.json();
          if (errData.detail) {
            errMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (e) {}
        console.error("[maquinasService.procesarReporteAveria] HTTP Error:", response.status, errMsg);
        throw new Error(errMsg);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error en maquinasService.procesarReporteAveria:", error);
      throw new Error(error.message || "Error al procesar el reporte de avería.");
    }
  },
};