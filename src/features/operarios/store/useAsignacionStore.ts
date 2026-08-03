import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchAsignacionesAction,
  createAsignacionAction,
  updateAsignacionAction,
  deleteAsignacionAction,
  reportarAvanceAction,
} from "@/features/operarios/actions/asignaciones.actions";
import type { AsignacionOrden } from "@/types";

interface AsignacionState {
  asignaciones: AsignacionOrden[];
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchAsignaciones: () => Promise<void>;
    createAsignacion: (data: Omit<AsignacionOrden, "id" | "fecha_asignacion">) => Promise<boolean>;
    updateAsignacion: (id: string, data: Partial<AsignacionOrden>) => Promise<boolean>;
    deleteAsignacion: (id: string) => Promise<boolean>;
    reportarAvance: (data: { asignacion_id: string; piezas_reportadas: number; piezas_buenas?: number; piezas_defectuosas?: number; maquina_id?: string; notas?: string; fecha_inicio?: string }) => Promise<boolean>;
    reset: () => void;
  };
}

export const useAsignacionStore = create<AsignacionState>()(
  devtools(
    (set, get) => ({
      // --- ESTADO ---
      asignaciones: [],
      isLoading: false,
      error: null,

      // --- ACCIONES ---
      actions: {
        fetchAsignaciones: async () => {
          set({ isLoading: true, error: null }, false, "asignaciones/fetch_start");
          try {
            const data = await fetchAsignacionesAction();
            set({ asignaciones: data, isLoading: false }, false, "asignaciones/fetch_success");
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error desconocido";
            set({ isLoading: false, error: errorMessage }, false, "asignaciones/fetch_error");
          }
        },

        createAsignacion: async (newData) => {
          set({ isLoading: true, error: null }, false, "asignaciones/create_start");
          try {
            const created = await createAsignacionAction(newData);
            set(
              (state) => ({
                asignaciones: [...state.asignaciones, created],
                isLoading: false,
              }),
              false,
              "asignaciones/create_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al crear";
            set({ isLoading: false, error: errorMessage }, false, "asignaciones/create_error");
            return false;
          }
        },

        updateAsignacion: async (id, data) => {
          set({ isLoading: true, error: null }, false, "asignaciones/update_start");
          try {
            const updated = await updateAsignacionAction(id, data);
            set(
              (state) => ({
                asignaciones: state.asignaciones.map((i) => (i.id === id ? updated : i)),
                isLoading: false,
              }),
              false,
              "asignaciones/update_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al actualizar";
            set({ isLoading: false, error: errorMessage }, false, "asignaciones/update_error");
            return false;
          }
        },

        deleteAsignacion: async (id) => {
          set({ isLoading: true, error: null }, false, "asignaciones/delete_start");
          try {
            await deleteAsignacionAction(id);
            set(
              (state) => ({
                asignaciones: state.asignaciones.filter((i) => i.id !== id),
                isLoading: false,
              }),
              false,
              "asignaciones/delete_success"
            );
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al eliminar";
            set({ isLoading: false, error: errorMessage }, false, "asignaciones/delete_error");
            return false;
          }
        },

        reportarAvance: async (data) => {
          set({ isLoading: true, error: null }, false, "asignaciones/reportar_avance_start");
          try {
            await reportarAvanceAction(data);
            set({ isLoading: false }, false, "asignaciones/reportar_avance_success");
            return true;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Error al reportar avance";
            set({ isLoading: false, error: errorMessage }, false, "asignaciones/reportar_avance_error");
            return false;
          }
        },

        reset: () => set({ asignaciones: [], isLoading: false, error: null }, false, "asignaciones/reset"),
      },
    }),
    { name: "AsignacionesStore" }
  )
);

export const useAsignacionActions = () => useAsignacionStore((state) => state.actions);
