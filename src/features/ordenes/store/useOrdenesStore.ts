import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ordenesService } from "@/features/ordenes/services/ordenes.service";
import type { Orden } from "@/types";

interface OrdenState {
  ordenes: Orden[];
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchOrdenes: () => Promise<void>;
    createOrden: (operario: Omit<Orden, "id">) => Promise<boolean>;
    updateOrden: (id: string, data: Partial<Orden>) => Promise<boolean>;
    deleteOrden: (id: string) => Promise<boolean>;
    reset: () => void;
  };
}

export const useOrdenStore = create<OrdenState>()(
  devtools(
    (set, get) => ({
      // --- ESTADO ---
      ordenes: [],
      isLoading: false,
      error: null,

      // --- ACCIONES ---
      actions: {
        fetchOrdenes: async () => {
          set({ isLoading: true, error: null }, false, "ordenes/fetch_start");
          try {
            const data = await ordenesService.getAll();
            set({ ordenes: data, isLoading: false }, false, "ordenes/fetch_success");
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error desconocido";
            set({ isLoading: false, error: errorMessage }, false, "ordenes/fetch_error");
          }
        },

        createOrden: async (newOrdenData) => {
          set({ isLoading: true, error: null }, false, "ordenes/create_start");
          try {
            const created = await ordenesService.create(newOrdenData);
            
            // Actualizamos el estado local agregando el nuevo elemento
            set(
              (state) => ({ 
                ordenes: [...state.ordenes, created], 
                isLoading: false 
              }), 
              false, 
              "ordenes/create_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al crear";
            set({ isLoading: false, error: errorMessage }, false, "ordenes/create_error");
            return false;
          }
        },

        updateOrden: async (id, data) => {
          set({ isLoading: true, error: null }, false, "ordenes/update_start");
          try {
            const updated = await ordenesService.update(id, data);
            
            // Mapeamos el array actual para reemplazar solo el operario editado
            set(
              (state) => ({
                ordenes: state.ordenes.map((i) => (i.id === id ? updated : i)),
                isLoading: false,
              }),
              false,
              "ordenes/update_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al actualizar";
            set({ isLoading: false, error: errorMessage }, false, "ordenes/update_error");
            return false;
          }
        },

        deleteOrden: async (id) => {
          set({ isLoading: true, error: null }, false, "ordenes/delete_start");
          try {
              await ordenesService.delete(id);
              set((state) => ({
                  ordenes: state.ordenes.filter(i => i.id !== id),
                  isLoading: false
              }), false, "ordenes/delete_success");
          } catch (e) {
              set({ isLoading: false, error: "ordenes/delete_error" });
          }
        },

        reset: () => set({ ordenes: [], isLoading: false, error: null }, false, "ordenes/reset"),
      },
    }),
    { name: "OrdenesStore" }
  )
);

// Helper Hook para consumir las acciones sin causar re-renders del estado
export const useOrdenActions = () => useOrdenStore((state) => state.actions);