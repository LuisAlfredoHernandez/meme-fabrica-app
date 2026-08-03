import type { Operario } from "@/types";
import { apiClient } from "@/shared/apiClient";

/**
 * Servicio para la gestión de operarios.
 */
export const operariosService = {
  getAll: async (token?: string): Promise<Operario[]> => {
    try {
      const response = await apiClient.get("/operarios", { token });

      if (!response.ok) throw new Error("No se pudo obtener la lista de operarios.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en operariosService.getAll:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  create: async (data: Omit<Operario, "id">, token?: string): Promise<Operario> => {
    try {
      const response = await apiClient.post("/operarios", data, { token });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || "No se pudo crear el operario.");
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error en operariosService.create:", error);
      throw new Error(error.message || "Error al crear el operario.");
    }
  },

  update: async (id: string, data: Partial<Operario>, token?: string): Promise<Operario> => {
    try {
      const response = await apiClient.patch(`/operarios/${id}`, data, { token });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || `No se pudo actualizar el operario con ID: ${id}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error en operariosService.update:", error);
      throw new Error(error.message || "Error al actualizar el operario.");
    }
  },

  delete: async (id: string, token?: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/operarios/${id}`, { token });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || `Error al eliminar el operario con ID: ${id}`);
      }
      return true;
    } catch (error: any) {
      console.error("Error en operariosService.delete:", error);
      throw new Error(error.message || "Error al intentar eliminar.");
    }
  },

  getById: async (id: string, token?: string): Promise<Operario | undefined> => {
    try {
      const response = await apiClient.get(`/operarios/${id}`, { token });

      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`No se pudo obtener el operario con ID: ${id}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error en operariosService.getById:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  iniciarSesion: async (token?: string): Promise<Operario> => {
    try {
      const response = await apiClient.post("/operarios/me/iniciar-sesion", undefined, { token });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || "Error al iniciar sesión de trabajo.");
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error en operariosService.iniciarSesion:", error);
      throw new Error(error.message || "Error de red al iniciar sesión.");
    }
  },
};
