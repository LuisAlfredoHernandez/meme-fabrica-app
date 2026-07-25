import type { Operario } from "@/types";

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

/**
 * Servicio para la gestión de operarios.
 */
export const operariosService = {
  getAll: async (token?: string): Promise<Operario[]> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/operarios`, {
        method: "GET",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error("No se pudo obtener la lista de operarios.");
      return await response.json();
    } catch (error: any) {
      console.error("Error en operariosService.getAll:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  create: async (data: Omit<Operario, "id">, token?: string): Promise<Operario> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/operarios`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/operarios/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/operarios/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/operarios/${id}`, {
        method: "GET",
        headers: getAuthHeaders(token),
      });

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/operarios/me/iniciar-sesion`, {
        method: "POST",
        headers: getAuthHeaders(token),
      });

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
