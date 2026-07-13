import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
    fetchMaquinasAction, 
    fetchAllMaquinaTypesAction, 
    createMaquinaAction, 
    updateMaquinaAction,
    reportarAveriaAction
} from "@/features/maquinas/actions/maquinas.actions";
import { Maquina, TipoMaquina, ReporteAveria } from "@/types";

interface MaquinasState {
    maquinas: Maquina[];
    maquinaTypes: TipoMaquina[];
    isLoading: boolean;
    error: string | null;
    actions: {
        fetchMaquinas: () => Promise<void>;
        fetchAllMaquinaTypes: () => Promise<void>;
        createMaquina: (data: Omit<Maquina, "id">) => Promise<boolean>;
        updateMaquina: (id: string, data: Partial<Maquina>) => Promise<boolean>;
        reportarAveria: (data: Omit<ReporteAveria, "id" | "fecha_reporte" | "estado">) => Promise<boolean>;
        reset: () => void;
    };
}

export const useMaquinasStore = create<MaquinasState>()(
    devtools(
        (set) => ({
            maquinas: [],
            maquinaTypes: [],
            isLoading: false,
            error: null,

            actions: {
                fetchMaquinas: async () => {
                    set({ isLoading: true, error: null }, false, "maquinas/fetch_start");
                    try {
                        const data = await fetchMaquinasAction();
                        set({ maquinas: data, isLoading: false }, false, "maquinas/fetch_success");
                    } catch (e) {
                        set({ isLoading: false, error: "Error al cargar máquinas" }, false, "maquinas/fetch_error");
                    }
                },

                fetchAllMaquinaTypes: async () => {
                    set({ isLoading: true, error: null }, false, "maquinasAllTypes/fetch_start");
                    try {
                        const data = await fetchAllMaquinaTypesAction();
                        set({ maquinaTypes: data, isLoading: false }, false, "maquinasAllTypes/fetch_success");
                    } catch (e) {
                        set({ isLoading: false, error: "Error al cargar los tipos de máquinas" }, false, "maquinasAllTypes/fetch_error");
                    }
                },

                createMaquina: async (data) => {
                    set({ isLoading: true }, false, "maquinas/create_start");
                    try {
                        const nueva = await createMaquinaAction(data);
                        set(
                            (state) => ({ maquinas: [...state.maquinas, nueva], isLoading: false }),
                            false,
                            "maquinas/create_success"
                        );
                        return true;
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : "Error al crear máquina";
                        set({ isLoading: false, error: errorMessage }, false, "maquinas/create_error");
                        throw e;
                    }
                },

                updateMaquina: async (id, data) => {
                    set({ isLoading: true }, false, "maquinas/update_start");
                    try {
                        const actualizada = await updateMaquinaAction(id, data);
                        set(
                            (state) => ({
                                maquinas: state.maquinas.map((m) => (m.id === id ? actualizada : m)),
                                isLoading: false,
                            }),
                            false,
                            "maquinas/update_success"
                        );
                        return true;
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : "Error al actualizar";
                        set({ isLoading: false, error: errorMessage }, false, "maquinas/update_error");
                        throw e;
                    }
                },

                reportarAveria: async (data) => {
                    set({ isLoading: true }, false, "maquinas/reportar_averia_start");
                    try {
                        await reportarAveriaAction(data);
                        set(
                            (state) => ({
                                maquinas: state.maquinas.map((m) =>
                                    m.id === data.maquina_id ? { ...m, estado: "mantenimiento" as any } : m
                                ),
                                isLoading: false
                            }),
                            false,
                            "maquinas/reportar_averia_success"
                        );
                        return true;
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : "Error al reportar avería";
                        set({ isLoading: false, error: errorMessage }, false, "maquinas/reportar_averia_error");
                        throw e;
                    }
                },

                reset: () => set({ maquinas: [], isLoading: false, error: null }, false, "maquinas/reset"),
            },
        }),
        { name: "MaquinasStore" }
    )
);

// Hook helper para extraer acciones
export const useMaquinasActions = () => useMaquinasStore((state) => state.actions);