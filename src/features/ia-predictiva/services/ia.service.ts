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

  uploadTrainData: async (file: File, token?: string): Promise<any> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/ia/upload-train-data`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Error al subir el archivo de datos históricos.");
    }
    return response.json();
  },

  predictDeliveryTime: async (
    cantidadPiezas: number,
    prioridadAlta: boolean,
    lineasProduccion: number,
    tipoPrenda: string,
    token?: string
  ): Promise<{ tiempo_estimado_horas: number; margen_error_horas: number; prenda_nueva: boolean; algoritmo_usado: string }> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/predict/delivery-time`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        cantidad_piezas: cantidadPiezas,
        prioridad_alta: prioridadAlta,
        lineas_produccion: lineasProduccion,
        tipo_prenda: tipoPrenda,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Fallo al calcular la estimación del tiempo.");
    }
    return response.json();
  },

  getIaStatus: async (token?: string): Promise<{
    modelo_cargado: boolean;
    algoritmo_activo: string;
    mae: number | null;
    mse: number | null;
    registros_entrenados: number;
    fecha_calibracion: string | null;
    columnas_entrenamiento: string[];
  }> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/status`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error("No se pudo obtener el estado del modelo de IA.");
    }
    return response.json();
  },

  exportHistory: async (token?: string): Promise<Response> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/ia/export-history`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error("No se pudo exportar el historial a Excel.");
    }
    return response;
  },
};
