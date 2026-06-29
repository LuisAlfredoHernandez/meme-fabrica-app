import type { AsignacionOrden } from "@/types";

const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const asignacionesService = {
  getAll: async (token?: string): Promise<AsignacionOrden[]> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/asignaciones`, {
        method: "GET",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error("No se pudo obtener la lista de asignaciones.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.getAll:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  create: async (data: Omit<AsignacionOrden, "id" | "fecha_asignacion">, token?: string): Promise<AsignacionOrden> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/asignaciones`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("No se pudo crear la asignación.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.create:", error);
      throw new Error(error.message || "Error al crear la asignación.");
    }
  },

  update: async (id: string, data: Partial<AsignacionOrden>, token?: string): Promise<AsignacionOrden> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/asignaciones/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`No se pudo actualizar la asignación con ID: ${id}`);
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.update:", error);
      throw new Error(error.message || "Error al actualizar la asignación.");
    }
  },

  delete: async (id: string, token?: string): Promise<boolean> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/asignaciones/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error(`Error al eliminar la asignación con ID: ${id}`);
      return true;
    } catch (error: any) {
      console.error("Error en asignacionesService.delete:", error);
      throw new Error(error.message || "Error al intentar eliminar.");
    }
  },

  reportarAvance: async (
    data: { asignacion_id: string; piezas_reportadas: number; maquina_id?: string; notas?: string },
    token?: string
  ): Promise<any> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/reportes-avance`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("No se pudo enviar el reporte de avance.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.reportarAvance:", error);
      throw new Error(error.message || "Error al enviar el reporte de avance.");
    }
  },
};

