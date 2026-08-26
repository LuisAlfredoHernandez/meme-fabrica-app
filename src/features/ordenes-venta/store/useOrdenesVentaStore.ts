import { create } from "zustand";
import { OrdenVenta } from "@/types";
import { 
  fetchOrdenesVentaAction, 
  createOrdenVentaAction, 
  updateOrdenVentaAction, 
  deleteOrdenVentaAction,
  generarFacturaAction
} from "../actions/ordenes-venta.actions";
import { OrdenVentaFormData } from "../schemas/ordenes-venta.schemas";

interface OrdenesVentaState {
  ordenesVenta: OrdenVenta[];
  loading: boolean;
  error: string | null;
  
  fetchOrdenesVenta: () => Promise<void>;
  createOrdenVenta: (data: OrdenVentaFormData) => Promise<OrdenVenta>;
  updateOrdenVenta: (id: string, data: Partial<OrdenVentaFormData>) => Promise<OrdenVenta>;
  deleteOrdenVenta: (id: string) => Promise<boolean>;
  generarFactura: (id: string) => Promise<any>;
}

export const useOrdenesVentaStore = create<OrdenesVentaState>((set, get) => ({
  ordenesVenta: [],
  loading: false,
  error: null,

  fetchOrdenesVenta: async () => {
    set({ loading: true, error: null });
    try {
      const ordenesVenta = await fetchOrdenesVentaAction();
      set({ ordenesVenta, loading: false });
    } catch (error: any) {
      console.error("[useOrdenesVentaStore] fetch error:", error);
      set({ error: error.message || "Error al cargar órdenes de venta", loading: false });
    }
  },

  createOrdenVenta: async (data: OrdenVentaFormData) => {
    set({ loading: true, error: null });
    try {
      const nuevaOrden = await createOrdenVentaAction(data);
      set((state) => ({
        ordenesVenta: [...state.ordenesVenta, nuevaOrden],
        loading: false
      }));
      return nuevaOrden;
    } catch (error: any) {
      console.error("[useOrdenesVentaStore] create error:", error);
      set({ error: error.message || "Error al crear orden de venta", loading: false });
      throw error;
    }
  },

  updateOrdenVenta: async (id: string, data: Partial<OrdenVentaFormData>) => {
    set({ loading: true, error: null });
    try {
      const actualizada = await updateOrdenVentaAction(id, data);
      set((state) => ({
        ordenesVenta: state.ordenesVenta.map(o => o.id === id ? actualizada : o),
        loading: false
      }));
      return actualizada;
    } catch (error: any) {
      console.error("[useOrdenesVentaStore] update error:", error);
      set({ error: error.message || "Error al actualizar orden de venta", loading: false });
      throw error;
    }
  },

  deleteOrdenVenta: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteOrdenVentaAction(id);
      set((state) => ({
        ordenesVenta: state.ordenesVenta.filter(o => o.id !== id),
        loading: false
      }));
      return true;
    } catch (error: any) {
      console.error("[useOrdenesVentaStore] delete error:", error);
      set({ error: error.message || "Error al eliminar orden de venta", loading: false });
      throw error;
    }
  },

  generarFactura: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await generarFacturaAction(id);
      // Reload after generating factura since state might change
      await get().fetchOrdenesVenta();
      set({ loading: false });
      return result;
    } catch (error: any) {
      console.error("[useOrdenesVentaStore] generarFactura error:", error);
      set({ error: error.message || "Error al generar factura", loading: false });
      throw error;
    }
  }
}));
