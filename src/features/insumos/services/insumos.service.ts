// ─────────────────────────────────────────────────────────────
// features/insumos/services/insumos.service.ts
// ─────────────────────────────────────────────────────────────
import type { Insumo } from "@/types";
import { apiClient } from "@/shared/apiClient";

export type TipoInsumo = "tela" | "accesorio";

/**
 * Servicio para la gestión de insumos conectándose a la API Real.
 */
export const insumosService = {
  /**
   * Obtiene todos los insumos disponibles.
   * @returns Una promesa que resuelve con la lista de insumos.
   */
  getAll: async (token?: string): Promise<Insumo[]> => {
    try {
      const response = await apiClient.get("/insumos", { token });

      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de insumos.");
      }

      const data: Insumo[] = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error en insumosService.getAll:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  /**
   * Crea un nuevo insumo y lo añade a la lista.
   * @param data - Los datos del nuevo insumo (sin el ID).
   * @returns Una promesa que resuelve con el insumo creado.
   */
  create: async (data: Omit<Insumo, "id">, token?: string): Promise<Insumo> => {
    try {
      const response = await apiClient.post("/insumos", data, { token });

      if (!response.ok) {
        throw new Error("No se pudo crear el insumo.");
      }

      const nuevoInsumo: Insumo = await response.json();
      return nuevoInsumo;
    } catch (error: any) {
      console.error("Error en insumosService.create:", error);
      throw new Error(error.message || "Error al crear el insumo.");
    }
  },

  /**
   * Actualiza un insumo existente por su ID.
   * @param id - El ID del insumo a actualizar.
   * @param data - Los campos parciales a modificar.
   * @returns Una promesa que resuelve con el insumo actualizado.
   */
  update: async (id: string, data: Partial<Insumo>, token?: string): Promise<Insumo> => {
    try {
      const response = await apiClient.patch(`/insumos/${id}`, data, { token });

      if (!response.ok) {
        throw new Error(`No se pudo actualizar el insumo con ID: ${id}`);
      }

      const insumoActualizado: Insumo = await response.json();
      return insumoActualizado;
    } catch (error: any) {
      console.error("Error en insumosService.update:", error);
      throw new Error(error.message || "Error al actualizar el insumo.");
    }
  },

  /**
   * Elimina un insumo del sistema.
   * @param id - El ID del insumo a eliminar.
   * @returns Una promesa que resuelve a true si fue eliminado.
   */
  delete: async (id: string, token?: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/insumos/${id}`, { token });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || `Error al eliminar el insumo con ID: ${id}`);
      }

      return true;
    } catch (error: any) {
      console.error("Error en insumosService.delete:", error);
      throw new Error(error.message || "Error al intentar eliminar.");
    }
  },

  /**
   * Obtiene un insumo por su ID.
   * @param id - El ID del insumo a buscar.
   * @returns Una promesa que resuelve con el insumo o lanza un error.
   */
  getById: async (id: string, token?: string): Promise<Insumo | undefined> => {
    try {
      const response = await apiClient.get(`/insumos/${id}`, { token });

      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`No se pudo obtener el insumo con ID: ${id}`);
      }

      const insumo: Insumo = await response.json();
      return insumo;
    } catch (error: any) {
      console.error("Error en insumosService.getById:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },
};
