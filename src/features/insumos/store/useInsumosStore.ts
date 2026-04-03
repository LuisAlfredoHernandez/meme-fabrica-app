import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { insumosService } from "@/features/insumos/services/insumos.service";
import type { Insumo } from "@/types";

interface InsumosState {
  insumos: Insumo[];
  isLoading: boolean;
  error: string | null;
  // Separamos las acciones en un objeto anidado para mejor organización
  actions: {
    fetchInsumos: () => Promise<void>;
    reset: () => void;
  };
}

export const useInsumosStore = create<InsumosState>()(
  devtools(
    (set) => ({
      // --- ESTADO ---
      insumos: [],
      isLoading: false,
      error: null,

      // --- ACCIONES ---
      actions: {
        fetchInsumos: async () => {
          set({ isLoading: true, error: null }, false, "insumos/fetch_start");

          try {
            const data = await insumosService.getAll();
            set({ insumos: data, isLoading: false }, false, "insumos/fetch_success");
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error desconocido";
            set({ isLoading: false, error: errorMessage }, false, "insumos/fetch_error");
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