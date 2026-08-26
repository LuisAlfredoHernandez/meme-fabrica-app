import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchInsumosAction,
  createInsumoAction,
  updateInsumoAction,
  deleteInsumoAction,
  ajusteInsumoAction
} from "@/features/insumos/actions/insumos.actions";
import type { Insumo } from "@/types";

interface InsumosState {
  insumos: Insumo[];
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchInsumos: () => Promise<void>;
    createInsumo: (insumo: Omit<Insumo, "id">) => Promise<boolean>;
    updateInsumo: (id: string, data: Partial<Insumo>) => Promise<boolean>;
    deleteInsumo: (id: string) => Promise<boolean>;
    ajusteInsumo: (id: string, data: { cantidad_ajuste: number; justificacion: string }) => Promise<boolean>;
    reset: () => void;
  };
}

export const useInsumosStore = create<InsumosState>()(
  devtools(
    (set, get) => ({
      // --- ESTADO ---
      insumos: [],
      isLoading: false,
      error: null,

      // --- ACCIONES ---
      actions: {
        fetchInsumos: async () => {
          set({ isLoading: true, error: null }, false, "insumos/fetch_start");
          try {
            const data = await fetchInsumosAction();
            set({ insumos: data, isLoading: false }, false, "insumos/fetch_success");
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error desconocido";
            set({ isLoading: false, error: errorMessage }, false, "insumos/fetch_error");
          }
        },

        createInsumo: async (newInsumoData) => {
          set({ isLoading: true, error: null }, false, "insumos/create_start");
          try {
            const created = await createInsumoAction(newInsumoData);

            // Actualizamos el estado local agregando el nuevo elemento
            set(
              (state) => ({
                insumos: [...state.insumos, created],
                isLoading: false
              }),
              false,
              "insumos/create_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al crear";
            set({ isLoading: false, error: errorMessage }, false, "insumos/create_error");
            throw e;
          }
        },

        updateInsumo: async (id, data) => {
          set({ isLoading: true, error: null }, false, "insumos/update_start");
          try {
            const updated = await updateInsumoAction(id, data);

            // Mapeamos el array actual para reemplazar solo el insumo editado
            set(
              (state) => ({
                insumos: state.insumos.map((i) => (i.id === id ? updated : i)),
                isLoading: false,
              }),
              false,
              "insumos/update_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al actualizar";
            set({ isLoading: false, error: errorMessage }, false, "insumos/update_error");
            throw e;
          }
        },

        deleteInsumo: async (id) => {
          set({ isLoading: true, error: null }, false, "insumos/delete_start");
          try {
            await deleteInsumoAction(id);
            set((state) => ({
              insumos: state.insumos.filter(i => i.id !== id),
              isLoading: false
            }), false, "insumos/delete_success");
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al eliminar";
            set({ isLoading: false, error: errorMessage }, false, "insumos/delete_error");
            throw e;
          }
        },

        ajusteInsumo: async (id, data) => {
          set({ isLoading: true, error: null }, false, "insumos/ajuste_start");
          try {
            const updated = await ajusteInsumoAction(id, data);
            set(
              (state) => ({
                insumos: state.insumos.map((i) => (i.id === id ? updated : i)),
                isLoading: false,
              }),
              false,
              "insumos/ajuste_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al ajustar stock";
            set({ isLoading: false, error: errorMessage }, false, "insumos/ajuste_error");
            throw e;
          }
        },

        reset: () => set({ insumos: [], isLoading: false, error: null }, false, "insumos/reset"),
      },
    }),
    { name: "InsumosStore" }
  )
);

// Helper Hook para consumir las acciones sin causar re-renders del estado
export const useInsumosActions = () => useInsumosStore((state) => state.actions);