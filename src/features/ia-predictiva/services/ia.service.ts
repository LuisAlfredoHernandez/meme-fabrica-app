const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const iaService = {
  getProjections: async (token?: string): Promise<any[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/projections`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error("No se pudieron obtener las proyecciones de IA.");
    }
    return response.json();
  },

  getBottlenecks: async (token?: string): Promise<{ cuellos: any[]; recomendaciones: any[] }> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/bottlenecks`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error("No se pudieron obtener los cuellos de botella de IA.");
    }
    return response.json();
  },

  simulateMts: async (cantidad: number, token?: string): Promise<any[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/simulate-mts`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ cantidad_piezas: cantidad }),
    });
    if (!response.ok) {
      throw new Error("Fallo en la simulación de impacto MTS.");
    }
    return response.json();
  },

  trainModel: async (token?: string): Promise<any> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/train`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Fallo en el reentrenamiento de IA.");
    }
    return response.json();
  },

  seedData: async (token?: string): Promise<any> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/seed`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error("Error al sembrar datos históricos en la base de datos.");
    }
    return response.json();
  },
};
