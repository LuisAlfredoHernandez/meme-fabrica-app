import { apiClient } from "@/shared/apiClient";

export const iaService = {
  getProjections: async (token?: string): Promise<any[]> => {
    const response = await apiClient.get("/ia/projections", { token });
    if (!response.ok) {
      throw new Error("No se pudieron obtener las proyecciones de IA.");
    }
    return response.json();
  },

  getBottlenecks: async (token?: string): Promise<{ cuellos: any[]; recomendaciones: any[] }> => {
    const response = await apiClient.get("/ia/bottlenecks", { token });
    if (!response.ok) {
      throw new Error("No se pudieron obtener los cuellos de botella de IA.");
    }
    return response.json();
  },

  simulateMts: async (cantidad: number, token?: string): Promise<any[]> => {
    const response = await apiClient.post("/ia/simulate-mts", { cantidad_piezas: cantidad }, { token });
    if (!response.ok) {
      throw new Error("Fallo en la simulación de impacto MTS.");
    }
    return response.json();
  },

  getActiveDelays: async (token?: string): Promise<{ riesgo: string; msg: string }[]> => {
    const response = await apiClient.get("/ia/active-delays", { token });
    if (!response.ok) {
      throw new Error("No se pudieron obtener las alertas tempranas de retrasos.");
    }
    return response.json();
  },

  trainModel: async (token?: string): Promise<any> => {
    const response = await apiClient.post("/ia/train", undefined, { token });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Fallo en el reentrenamiento de IA.");
    }
    return response.json();
  },

  seedData: async (token?: string): Promise<any> => {
    const response = await apiClient.post("/ia/seed", undefined, { token });
    if (!response.ok) {
      throw new Error("Error al sembrar datos históricos en la base de datos.");
    }
    return response.json();
  },

  uploadTrainData: async (file: File, token?: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/ia/upload-train-data", formData, { token });
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
    const response = await apiClient.post("/ia/predict/delivery-time", {
      cantidad_piezas: cantidadPiezas,
      prioridad_alta: prioridadAlta,
      lineas_produccion: lineasProduccion,
      tipo_prenda: tipoPrenda,
    }, { token });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Fallo al calcular la estimación del tiempo.");
    }
    return response.json();
  },

  predictOrderItems: async (
    items: { tipo_prenda: string; cantidad_piezas: number }[],
    prioridadAlta: boolean,
    lineasProduccion: number,
    token?: string
  ): Promise<{
    tiempo_estimado_total_horas: number | null;
    margen_error_total_horas: number | null;
    prenda_nueva_global: boolean;
    detalles: {
      tipo_prenda: string;
      cantidad_piezas: number;
      tiempo_estimado_horas: number | null;
      margen_error_horas: number | null;
      prenda_nueva: boolean;
    }[];
  }> => {
    const response = await apiClient.post("/ia/predict/order-items", {
      items,
      prioridad_alta: prioridadAlta,
      lineas_produccion: lineasProduccion,
    }, { token });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Fallo al calcular la estimación consolidada.");
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
    const response = await apiClient.get("/ia/status", { token });
    if (!response.ok) {
      throw new Error("No se pudo obtener el estado del modelo de IA.");
    }
    return response.json();
  },

  exportHistory: async (token?: string): Promise<Response> => {
    const response = await apiClient.get("/ia/export-history", { token, isDownload: true });
    if (!response.ok) {
      throw new Error("No se pudo exportar el historial.");
    }
    return response;
  },

  getUniqueGarments: async (token?: string): Promise<{ prendas: string[] }> => {
    const response = await apiClient.get("/ia/prendas-unicas", { token });
    if (!response.ok) {
      throw new Error("No se pudieron obtener las prendas únicas.");
    }
    return response.json();
  }
};
