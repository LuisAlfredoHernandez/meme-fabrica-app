import { apiClient } from "@/shared/apiClient";
import { FacturaDetalle } from "@/types";

export const facturasService = {
  getAll: async (token?: string): Promise<FacturaDetalle[]> => {
    const res = await apiClient.get("/facturas", { token });
    if (!res.ok) throw new Error("Error al obtener facturas");
    return res.json();
  },

  getById: async (id: string, token?: string): Promise<FacturaDetalle> => {
    const res = await apiClient.get(`/facturas/${id}`, { token });
    if (!res.ok) throw new Error("Error al obtener factura");
    return res.json();
  },

  procesar: async (id: string, token?: string): Promise<FacturaDetalle> => {
    const res = await apiClient.patch(`/facturas/${id}/procesar`, {}, { token });
    if (!res.ok) throw new Error("Error al procesar factura");
    return res.json();
  }
};
