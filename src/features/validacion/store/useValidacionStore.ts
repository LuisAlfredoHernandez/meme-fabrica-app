import { create } from "zustand";
import { ValidacionReporte } from "../schemas/validacion.schema";
import { fetchPendientesAction, validarReporteAction } from "../actions/validacion.actions";

interface ValidacionState {
    pendientes: ValidacionReporte[];
    isLoading: boolean;
    error: string | null;
}

interface ValidacionActions {
    fetchPendientes: () => Promise<void>;
    validarReporte: (id: string, buenas: number, defectuosas: number) => Promise<boolean>;
}

export const useValidacionStore = create<ValidacionState & { actions: ValidacionActions }>((set, get) => ({
    pendientes: [],
    isLoading: false,
    error: null,
    actions: {
        fetchPendientes: async () => {
            set({ isLoading: true, error: null });
            try {
                const data = await fetchPendientesAction();
                set({ pendientes: data, isLoading: false });
            } catch (error) {
                set({ error: "Error al cargar reportes pendientes", isLoading: false });
            }
        },
        validarReporte: async (id: string, buenas: number, defectuosas: number) => {
            set({ isLoading: true, error: null });
            try {
                const success = await validarReporteAction(id, buenas, defectuosas);
                if (success) {
                    set(state => ({
                        pendientes: state.pendientes.filter(p => p.id !== id),
                        isLoading: false
                    }));
                } else {
                    set({ error: "No se pudo validar el reporte", isLoading: false });
                }
                return success;
            } catch (error) {
                set({ error: "Error al validar el reporte", isLoading: false });
                return false;
            }
        }
    }
}));


export const useValidacionActions = () => useValidacionStore(state => state.actions);