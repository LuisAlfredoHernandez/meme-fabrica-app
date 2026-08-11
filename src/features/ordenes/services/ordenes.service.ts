import { Orden, Temporada } from "@/types";
import { apiClient } from "@/shared/apiClient";

/**
 * Mappings for Temporada enum to reconcile frontend lowercase Spanish values with backend TitleCase/ASCII values.
 */
const API_TEMPORADA_TO_FRONTEND: Record<string, Temporada> = {
  "Primavera": "primavera",
  "Verano": "verano",
  "Otono": "otoño",
  "Invierno": "invierno",
};

const FRONTEND_TEMPORADA_TO_API: Record<string, string> = {
  "primavera": "Primavera",
  "verano": "Verano",
  "otoño": "Otono",
  "invierno": "Invierno",
};

/**
 * Helpers to map between the API's snake_case structure and the frontend's camelCase state.
 */
export const mapApiToFrontend = (api: any): Orden => {
  return {
    id: api.id,
    numero: api.numero,
    cliente: api.cliente,
    tipo: api.tipo ? api.tipo.toUpperCase() : "MTO",
    estado: api.estado ? api.estado.toLowerCase() : "pendiente",
    temporada: api.temporada ? (API_TEMPORADA_TO_FRONTEND[api.temporada] || "primavera") : "primavera",
    prioridad: api.prioridad ? api.prioridad.toLowerCase() : "normal",
    fechaCreacion: api.fecha_creacion ? api.fecha_creacion.split("T")[0] : "",
    fechaEntregaEstimada: api.fecha_entrega_estimada ? api.fecha_entrega_estimada.split("T")[0] : "",
    fechaEntregaPredicha: api.fecha_entrega_predicha ? api.fecha_entrega_predicha.split("T")[0] : undefined,
    fechaEntregaReal: api.fecha_entrega_real ? api.fecha_entrega_real.split("T")[0] : undefined,
    creadaPor: "", // The backend does not maintain a creada_por field on the Orden entity.
    notas: api.notas || "",
    lineas: (api.lineas || []).map((linea: any) => ({
      id: linea.id,
      productoTipo: linea.producto_tipo || "otro",
      descripcion: linea.descripcion,
      cantidad: linea.cantidad,
      cantidadCompletada: linea.cantidad_completada || 0,
      talla: linea.talla,
      color: linea.color || "",
      insumos: (linea.insumos || []).map((ins: any) => ({
        insumoId: ins.insumo_id,
        cantidadRequerida: ins.cantidad_requerida,
        unidad: ins.unidad,
      })),
    })),
    asignaciones: (api.asignaciones || []).map((asig: any) => ({
      id: asig.id,
      operario_id: asig.operario_id,
      tarea: asig.tarea,
      piezas_requeridas: asig.piezas_requeridas,
      notas: asig.notas || "",
    })),
  };
};

export const mapFrontendToApi = (frontend: any): any => {
  return {
    cliente: frontend.cliente,
    tipo: frontend.tipo,
    prioridad: frontend.prioridad,
    temporada: frontend.temporada ? (FRONTEND_TEMPORADA_TO_API[frontend.temporada] || frontend.temporada) : null,
    fecha_entrega_estimada: frontend.fechaEntregaEstimada
      ? (frontend.fechaEntregaEstimada.includes("T")
          ? frontend.fechaEntregaEstimada
          : `${frontend.fechaEntregaEstimada}T00:00:00Z`)
      : new Date().toISOString(),
    notas: frontend.notas || "",
    lineas: (frontend.lineas || []).map((linea: any) => {
      // Infers product type from description if not explicitly set
      let prodTipo = linea.productoTipo || "otro";
      if (!linea.productoTipo && linea.descripcion) {
        const descLower = linea.descripcion.toLowerCase();
        if (descLower.includes("licra")) prodTipo = "licra";
        else if (descLower.includes("jogger")) prodTipo = "jogger";
        else if (descLower.includes("vestido")) prodTipo = "vestido";
        else if (descLower.includes("t-shirt") || descLower.includes("t_shirt")) prodTipo = "t_shirt";
        else if (descLower.includes("short")) prodTipo = "short";
        else if (descLower.includes("blusa")) prodTipo = "blusa";
      }

      return {
        producto_tipo: prodTipo,
        descripcion: linea.descripcion,
        cantidad: Number(linea.cantidad),
        cantidad_completada: Number(linea.cantidadCompletada || 0),
        talla: linea.talla,
        color: linea.color || "",
        insumos: (linea.insumos || []).map((ins: any) => ({
          insumo_id: ins.insumoId,
          cantidad_requerida: Number(ins.cantidadRequerida),
          unidad: ins.unidad,
        })),
      };
    }),
    asignaciones: (frontend.asignaciones || []).map((asig: any) => ({
      id: asig.id,
      operario_id: asig.operario_id,
      tarea: asig.tarea,
      piezas_requeridas: Number(asig.piezas_requeridas),
      notas: asig.notas || "",
    })),
  };
};

export const mapFrontendUpdateToApi = (data: Partial<Orden>): any => {
  const payload: any = {};

  if (data.cliente !== undefined) payload.cliente = data.cliente;
  if (data.tipo !== undefined) payload.tipo = data.tipo;
  if (data.estado !== undefined) payload.estado = data.estado;
  if (data.prioridad !== undefined) payload.prioridad = data.prioridad;
  if (data.temporada !== undefined) {
    payload.temporada = data.temporada ? (FRONTEND_TEMPORADA_TO_API[data.temporada] || data.temporada) : null;
  }
  if (data.fechaEntregaEstimada !== undefined) {
    payload.fecha_entrega_estimada = data.fechaEntregaEstimada
      ? (data.fechaEntregaEstimada.includes("T")
          ? data.fechaEntregaEstimada
          : `${data.fechaEntregaEstimada}T00:00:00Z`)
      : null;
  }
  if (data.notas !== undefined) payload.notas = data.notas;
  if (data.lineas !== undefined) {
    payload.lineas = data.lineas.map((linea: any) => {
      let prodTipo = linea.productoTipo || "otro";
      if (!linea.productoTipo && linea.descripcion) {
        const descLower = linea.descripcion.toLowerCase();
        if (descLower.includes("licra")) prodTipo = "licra";
        else if (descLower.includes("jogger")) prodTipo = "jogger";
        else if (descLower.includes("vestido")) prodTipo = "vestido";
        else if (descLower.includes("t-shirt") || descLower.includes("t_shirt")) prodTipo = "t_shirt";
        else if (descLower.includes("short")) prodTipo = "short";
        else if (descLower.includes("blusa")) prodTipo = "blusa";
      }

      return {
        id: linea.id,
        producto_tipo: prodTipo,
        descripcion: linea.descripcion,
        cantidad: Number(linea.cantidad),
        cantidad_completada: Number(linea.cantidadCompletada || 0),
        talla: linea.talla,
        color: linea.color || "",
        insumos: (linea.insumos || []).map((ins: any) => ({
          insumo_id: ins.insumoId,
          cantidad_requerida: Number(ins.cantidadRequerida),
          unidad: ins.unidad,
        })),
      };
    });
  }
  if (data.asignaciones !== undefined) {
    payload.asignaciones = data.asignaciones.map((asig: any) => ({
      id: asig.id,
      operario_id: asig.operario_id,
      tarea: asig.tarea,
      piezas_requeridas: Number(asig.piezas_requeridas),
      notas: asig.notas || "",
    }));
  }

  return payload;
};

/**
 * Service to manage production orders by communicating with the backend API.
 */
export const ordenesService = {
  /**
   * Fetches all orders from the production queue.
   */
  getAll: async (token?: string): Promise<Orden[]> => {
    try {
      const response = await apiClient.get("/ordenes", { token });

      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de órdenes.");
      }

      const data: any[] = await response.json();
      return data.map(mapApiToFrontend);
    } catch (error: any) {
      console.error("Error en ordenesService.getAll:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  /**
   * Creates a new production order.
   */
  create: async (data: Omit<Orden, "id">, token?: string): Promise<Orden> => {
    try {
      const mappedData = mapFrontendToApi(data);

      const response = await apiClient.post("/ordenes", mappedData, { token });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response details:", errorText);
        throw new Error("No se pudo crear la orden.");
      }

      const created: any = await response.json();
      return mapApiToFrontend(created);
    } catch (error: any) {
      console.error("Error en ordenesService.create:", error);
      throw new Error(error.message || "Error al crear la orden.");
    }
  },

  /**
   * Updates an existing order.
   */
  update: async (id: string, data: Partial<Orden>, token?: string): Promise<Orden> => {
    try {
      const mappedData = mapFrontendUpdateToApi(data);

      const response = await apiClient.patch(`/ordenes/${id}`, mappedData, { token });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response details:", errorText);
        let detailMsg = `No se pudo actualizar la orden con ID: ${id}`;
        try {
            const parsed = JSON.parse(errorText);
            if (parsed.detail) detailMsg = parsed.detail;
        } catch (e) {}
        throw new Error(detailMsg);
      }

      const updated: any = await response.json();
      return mapApiToFrontend(updated);
    } catch (error: any) {
      console.error("Error en ordenesService.update:", error);
      throw new Error(error.message || "Error al actualizar la orden.");
    }
  },

  /**
   * Deletes an order.
   */
  delete: async (id: string, token?: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/ordenes/${id}`, { token });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || `Error al eliminar la orden con ID: ${id}`);
      }

      return true;
    } catch (error: any) {
      console.error("Error en ordenesService.delete:", error);
      throw new Error(error.message || "Error al intentar eliminar.");
    }
  },

  /**
   * Fetches an order by its ID.
   */
  getById: async (id: string, token?: string): Promise<Orden | undefined> => {
    try {
      const response = await apiClient.get(`/ordenes/${id}`, { token });

      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`No se pudo obtener la orden con ID: ${id}`);
      }

      const data: any = await response.json();
      return mapApiToFrontend(data);
    } catch (error: any) {
      console.error("Error en ordenesService.getById:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },

  /**
   * Fetches all registered garment names.
   */
  getPrendas: async (token?: string): Promise<string[]> => {
    try {
      const response = await apiClient.get("/ordenes/prendas", { token });

      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de prendas.");
      }

      return response.json();
    } catch (error: any) {
      console.error("Error en ordenesService.getPrendas:", error);
      throw new Error(error.message || "Error al conectar con el servidor.");
    }
  },
};