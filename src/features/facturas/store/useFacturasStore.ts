import { create } from "zustand";
import { FacturaDetalle } from "@/types";
import { fetchFacturasAction, procesarFacturaAction } from "../actions/facturas.actions";

interface FacturasState {
  facturas: FacturaDetalle[];
  loading: boolean;
  error: string | null;
  
  fetchFacturas: () => Promise<void>;
  procesarFactura: (id: string) => Promise<FacturaDetalle>;
}

export const useFacturasStore = create<FacturasState>((set, get) => ({
  facturas: [],
  loading: false,
  error: null,

  fetchFacturas: async () => {
    set({ loading: true, error: null });
    try {
      const facturas = await fetchFacturasAction();
      set({ facturas, loading: false });
    } catch (error: any) {
      console.error("[useFacturasStore] fetch error:", error);
      set({ error: error.message || "Error al cargar facturas", loading: false });
    }
  },

  procesarFactura: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const actualizada = await procesarFacturaAction(id);
      set((state) => ({
        facturas: state.facturas.map(f => f.id === id ? actualizada : f),
        loading: false
      }));
      return actualizada;
    } catch (error: any) {
      console.error("[useFacturasStore] procesar error:", error);
      set({ error: error.message || "Error al procesar factura", loading: false });
      throw error;
    }
  }
}));
