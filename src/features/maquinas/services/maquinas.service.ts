import { Maquina, TipoMaquina, MAQUINAS_LIST } from "@/types";

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

export const maquinasService = {
  getAll: async (token?: string): Promise<Maquina[]> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/maquinas`, {
        method: "GET",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error("No se pudo obtener la lista de máquinas.");
      return await response.json();
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
      const response = await fetch(`${API_URL}/maquinas`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("No se pudo crear la máquina.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en maquinasService.create:", error);
      throw new Error(error.message || "Error al crear la máquina.");
    }
  },

  update: async (id: string, data: Partial<Maquina>, token?: string): Promise<Maquina> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/maquinas/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`No se pudo actualizar la máquina con ID: ${id}`);
      return await response.json();
    } catch (error: any) {
      console.error("Error en maquinasService.update:", error);
      throw new Error(error.message || "Error al actualizar la máquina.");
    }
  },
};