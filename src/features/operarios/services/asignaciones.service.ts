import type { AsignacionOrden } from "@/types";
import { apiClient } from "@/shared/apiClient";

export const asignacionesService = {
  getAll: async (token?: string): Promise<AsignacionOrden[]> => {
    try {
      const response = await apiClient.get("/asignaciones", { token });

      if (!response.ok) throw new Error("No se pudo obtener la lista de asignaciones.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.getAll:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  create: async (data: Omit<AsignacionOrden, "id" | "fecha_asignacion">, token?: string): Promise<AsignacionOrden> => {
    try {
      const response = await apiClient.post("/asignaciones", data, { token });

      if (!response.ok) throw new Error("No se pudo crear la asignación.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.create:", error);
      throw new Error(error.message || "Error al crear la asignación.");
    }
  },

  update: async (id: string, data: Partial<AsignacionOrden>, token?: string): Promise<AsignacionOrden> => {
    try {
      const response = await apiClient.patch(`/asignaciones/${id}`, data, { token });

      if (!response.ok) throw new Error(`No se pudo actualizar la asignación con ID: ${id}`);
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.update:", error);
      throw new Error(error.message || "Error al actualizar la asignación.");
    }
  },

  delete: async (id: string, token?: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/asignaciones/${id}`, { token });

      if (!response.ok) throw new Error(`Error al eliminar la asignación con ID: ${id}`);
      return true;
    } catch (error: any) {
      console.error("Error en asignacionesService.delete:", error);
      throw new Error(error.message || "Error al intentar eliminar.");
    }
  },

  reportarAvance: async (
    data: { asignacion_id: string; piezas_reportadas: number; piezas_buenas?: number; piezas_defectuosas?: number; maquina_id?: string; notas?: string; fecha_inicio?: string },
    token?: string
  ): Promise<any> => {
    try {
      const response = await apiClient.post("/reportes-avance", data, { token });

      if (!response.ok) throw new Error("No se pudo enviar el reporte de avance.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en asignacionesService.reportarAvance:", error);
      throw new Error(error.message || "Error al enviar el reporte de avance.");
    }
  },
};

