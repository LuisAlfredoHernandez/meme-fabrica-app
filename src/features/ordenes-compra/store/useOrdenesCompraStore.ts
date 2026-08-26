import { create } from "zustand";
import { OrdenCompra } from "@/types";
import { 
  fetchOrdenesCompraAction, 
  createOrdenCompraAction, 
  updateOrdenCompraAction, 
  deleteOrdenCompraAction,
  recibirOrdenCompraAction
} from "../actions/ordenes-compra.actions";
import { OrdenCompraFormData } from "../schemas/ordenes-compra.schemas";

interface OrdenesCompraState {
  ordenesCompra: OrdenCompra[];
  loading: boolean;
  error: string | null;
  
  fetchOrdenesCompra: () => Promise<void>;
  createOrdenCompra: (data: OrdenCompraFormData) => Promise<OrdenCompra>;
  updateOrdenCompra: (id: string, data: Partial<OrdenCompraFormData>) => Promise<OrdenCompra>;
  deleteOrdenCompra: (id: string) => Promise<boolean>;
  recibirOrdenCompra: (id: string) => Promise<OrdenCompra>;
}

export const useOrdenesCompraStore = create<OrdenesCompraState>((set, get) => ({
  ordenesCompra: [],
  loading: false,
  error: null,

  fetchOrdenesCompra: async () => {
    set({ loading: true, error: null });
    try {
      const ordenesCompra = await fetchOrdenesCompraAction();
      set({ ordenesCompra, loading: false });
    } catch (error: any) {
      console.error("[useOrdenesCompraStore] fetch error:", error);
      set({ error: error.message || "Error al cargar órdenes de compra", loading: false });
    }
  },

  createOrdenCompra: async (data: OrdenCompraFormData) => {
    set({ loading: true, error: null });
    try {
      const nuevaOrden = await createOrdenCompraAction(data);
      set((state) => ({
        ordenesCompra: [...state.ordenesCompra, nuevaOrden],
        loading: false
      }));
      return nuevaOrden;
    } catch (error: any) {
      console.error("[useOrdenesCompraStore] create error:", error);
      set({ error: error.message || "Error al crear orden de compra", loading: false });
      throw error;
    }
  },

  updateOrdenCompra: async (id: string, data: Partial<OrdenCompraFormData>) => {
    set({ loading: true, error: null });
    try {
      const actualizada = await updateOrdenCompraAction(id, data);
      set((state) => ({
        ordenesCompra: state.ordenesCompra.map(o => o.id === id ? actualizada : o),
        loading: false
      }));
      return actualizada;
    } catch (error: any) {
      console.error("[useOrdenesCompraStore] update error:", error);
      set({ error: error.message || "Error al actualizar orden de compra", loading: false });
      throw error;
    }
  },

  deleteOrdenCompra: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteOrdenCompraAction(id);
      set((state) => ({
        ordenesCompra: state.ordenesCompra.filter(o => o.id !== id),
        loading: false
      }));
      return true;
    } catch (error: any) {
      console.error("[useOrdenesCompraStore] delete error:", error);
      set({ error: error.message || "Error al eliminar orden de compra", loading: false });
      throw error;
    }
  },

  recibirOrdenCompra: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const actualizada = await recibirOrdenCompraAction(id);
      set((state) => ({
        ordenesCompra: state.ordenesCompra.map(o => o.id === id ? actualizada : o),
        loading: false
      }));
      return actualizada;
    } catch (error: any) {
      console.error("[useOrdenesCompraStore] recibir error:", error);
      set({ error: error.message || "Error al recibir orden de compra", loading: false });
      throw error;
    }
  }
}));
