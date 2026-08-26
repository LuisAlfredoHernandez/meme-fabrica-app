import { apiClient } from "@/shared/apiClient";
import { OrdenVenta } from "@/types";
import { OrdenVentaFormData } from "../schemas/ordenes-venta.schemas";

export const ordenesVentaService = {
  getAll: async (token?: string): Promise<OrdenVenta[]> => {
    const res = await apiClient.get("/ordenes-venta", { token });
    if (!res.ok) throw new Error("Error fetching");
    return res.json();
  },

  getById: async (id: string, token?: string): Promise<OrdenVenta> => {
    const res = await apiClient.get(`/ordenes-venta/${id}`, { token });
    if (!res.ok) throw new Error("Error fetching by id");
    return res.json();
  },

  create: async (data: OrdenVentaFormData, token?: string): Promise<OrdenVenta> => {
    const res = await apiClient.post("/ordenes-venta", data, { token });
    if (!res.ok) throw new Error("Error creating");
    return res.json();
  },

  update: async (id: string, data: Partial<OrdenVentaFormData>, token?: string): Promise<OrdenVenta> => {
    const res = await apiClient.patch(`/ordenes-venta/${id}`, data, { token });
    if (!res.ok) throw new Error("Error updating");
    return res.json();
  },

  delete: async (id: string, token?: string): Promise<boolean> => {
    await apiClient.delete(`/ordenes-venta/${id}`, { token });
    return true;
  },

  generarFactura: async (id: string, token?: string): Promise<any> => {
    const res = await apiClient.post(`/ordenes-venta/${id}/generar-factura`, {}, { token });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error generating invoice");
    }
    return res.json();
  }
};
