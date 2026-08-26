import { apiClient } from "@/shared/apiClient";
import { OrdenCompra } from "@/types";
import { OrdenCompraFormData } from "../schemas/ordenes-compra.schemas";

export const ordenesCompraService = {
  getAll: async (token?: string): Promise<OrdenCompra[]> => {
    const res = await apiClient.get("/ordenes-compra", { token });
    if (!res.ok) throw new Error("Error fetching");
    return res.json();
  },

  getById: async (id: string, token?: string): Promise<OrdenCompra> => {
    const res = await apiClient.get(`/ordenes-compra/${id}`, { token });
    if (!res.ok) throw new Error("Error fetching by id");
    return res.json();
  },

  create: async (data: OrdenCompraFormData, token?: string): Promise<OrdenCompra> => {
    const res = await apiClient.post("/ordenes-compra", data, { token });
    if (!res.ok) throw new Error("Error creating");
    return res.json();
  },

  update: async (id: string, data: Partial<OrdenCompraFormData>, token?: string): Promise<OrdenCompra> => {
    const res = await apiClient.patch(`/ordenes-compra/${id}`, data, { token });
    if (!res.ok) throw new Error("Error updating");
    return res.json();
  },

  delete: async (id: string, token?: string): Promise<boolean> => {
    await apiClient.delete(`/ordenes-compra/${id}`, { token });
    return true;
  },

  recibir: async (id: string, token?: string): Promise<OrdenCompra> => {
    const res = await apiClient.patch(`/ordenes-compra/${id}/recibir`, {}, { token });
    if (!res.ok) throw new Error("Error receiving");
    return res.json();
  }
};
