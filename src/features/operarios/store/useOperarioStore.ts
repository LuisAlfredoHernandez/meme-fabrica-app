import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchOperariosAction,
  createOperarioAction,
  updateOperarioAction,
  deleteOperarioAction,
} from "@/features/operarios/actions/operarios.actions";
import type { Operario } from "@/types";

interface OperarioState {
  operarios: Operario[];
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchOperarios: () => Promise<void>;
    createOperario: (operario: Omit<Operario, "id">) => Promise<boolean>;
    updateOperario: (id: string, data: Partial<Operario>) => Promise<boolean>;
    deleteOperario: (id: string) => Promise<boolean>;
    reset: () => void;
  };
}

export const useOperarioStore = create<OperarioState>()(
  devtools(
    (set, get) => ({
      // --- ESTADO ---
      operarios: [],
      isLoading: false,
      error: null,

      // --- ACCIONES ---
      actions: {
        fetchOperarios: async () => {
          set({ isLoading: true, error: null }, false, "operarios/fetch_start");
          try {
            const data = await fetchOperariosAction();
            set({ operarios: data, isLoading: false }, false, "operarios/fetch_success");
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error desconocido";
            set({ isLoading: false, error: errorMessage }, false, "operarios/fetch_error");
          }
        },

        createOperario: async (newOperarioData) => {
          set({ isLoading: true, error: null }, false, "operarios/create_start");
          try {
            const created = await createOperarioAction(newOperarioData);
            // Actualizamos el estado local agregando el nuevo elemento
            set(
              (state) => ({
                operarios: [...state.operarios, created],
                isLoading: false
              }),
              false,
              "operarios/create_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al crear";
            set({ isLoading: false, error: errorMessage }, false, "operarios/create_error");
            throw e;
          }
        },

        updateOperario: async (id, data) => {
          set({ isLoading: true, error: null }, false, "operarios/update_start");
          try {
            const updated = await updateOperarioAction(id, data);

            // Mapeamos el array actual para reemplazar solo el operario editado
            set(
              (state) => ({
                operarios: state.operarios.map((i) => (i.id === id ? updated : i)),
                isLoading: false,
              }),
              false,
              "operarios/update_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al actualizar";
            set({ isLoading: false, error: errorMessage }, false, "operarios/update_error");
            throw e;
          }
        },

        deleteOperario: async (id) => {
          set({ isLoading: true, error: null }, false, "operarios/delete_start");
          try {
            await deleteOperarioAction(id);
            set((state) => ({
              operarios: state.operarios.filter(i => i.id !== id),
              isLoading: false
            }), false, "operarios/delete_success");
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al eliminar";
            set({ isLoading: false, error: errorMessage }, false, "operarios/delete_error");
            throw e;
          }
        },

        reset: () => set({ operarios: [], isLoading: false, error: null }, false, "operarios/reset"),
      },
    }),
    { name: "OperariosStore" }
  )
);

// Helper Hook para consumir las acciones sin causar re-renders del estado
export const useOperarioActions = () => useOperarioStore((state) => state.actions);