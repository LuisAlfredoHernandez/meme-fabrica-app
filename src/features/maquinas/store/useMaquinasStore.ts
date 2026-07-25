import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
    fetchMaquinasAction, 
    fetchAllMaquinaTypesAction, 
    createMaquinaAction, 
    updateMaquinaAction,
    reportarAveriaAction,
    fetchReportesAveriaPendientesAction,
    procesarReporteAveriaAction
} from "@/features/maquinas/actions/maquinas.actions";
import { Maquina, TipoMaquina, ReporteAveria } from "@/types";

interface MaquinasState {
    maquinas: Maquina[];
    maquinaTypes: TipoMaquina[];
    reportesAveriaPendientes: ReporteAveria[];
    isLoading: boolean;
    error: string | null;
    actions: {
        fetchMaquinas: () => Promise<void>;
        fetchAllMaquinaTypes: () => Promise<void>;
        fetchReportesAveriaPendientes: () => Promise<void>;
        createMaquina: (data: Omit<Maquina, "id">) => Promise<boolean>;
        updateMaquina: (id: string, data: Partial<Maquina>) => Promise<boolean>;
        reportarAveria: (data: Omit<ReporteAveria, "id" | "fecha_reporte" | "estado">) => Promise<boolean>;
        procesarReporteAveria: (id: string, aprobado: boolean, notas?: string) => Promise<boolean>;
        reset: () => void;
    };
}

export const useMaquinasStore = create<MaquinasState>()(
    devtools(
        (set, get) => ({
            maquinas: [],
            maquinaTypes: [],
            reportesAveriaPendientes: [],
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

                fetchReportesAveriaPendientes: async () => {
                    try {
                        const data = await fetchReportesAveriaPendientesAction();
                        set({ reportesAveriaPendientes: data || [] }, false, "maquinas/fetch_averias_success");
                    } catch (e) {
                        console.error("Error al cargar reportes de avería pendientes:", e);
                        set({ reportesAveriaPendientes: [] }, false, "maquinas/fetch_averias_error");
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
                        const nuevaAveria = await reportarAveriaAction(data);
                        set(
                            (state) => ({
                                reportesAveriaPendientes: nuevaAveria 
                                    ? [...state.reportesAveriaPendientes.filter(r => r.id !== nuevaAveria.id), nuevaAveria]
                                    : state.reportesAveriaPendientes,
                                maquinas: state.maquinas.map((m) =>
                                    (m.id === data.maquina_id || m.tipo === data.maquina_id) ? { ...m, estado: "bajo_revision" as any } : m
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

                procesarReporteAveria: async (id, aprobado, notas) => {
                    set({ isLoading: true }, false, "maquinas/procesar_averia_start");
                    try {
                        const res = await procesarReporteAveriaAction(id, aprobado, notas);
                        const nuevoEstado: any = aprobado ? "fuera_servicio" : "operativa";
                        
                        // Asegurar que el estado de la máquina se actualiza en la base de datos
                        if (res && res.maquina_id) {
                            try {
                                await updateMaquinaAction(res.maquina_id, { estado: nuevoEstado });
                            } catch (updateErr) {
                                console.error("No se pudo actualizar el estado de la máquina en DB:", updateErr);
                            }
                        }

                        set(
                            (state) => ({
                                reportesAveriaPendientes: state.reportesAveriaPendientes.filter((r) => r.id !== id),
                                maquinas: state.maquinas.map((m) =>
                                    m.id === res.maquina_id ? { ...m, estado: nuevoEstado } : m
                                ),
                                isLoading: false
                            }),
                            false,
                            "maquinas/procesar_averia_success"
                        );
                        return true;
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : "Error al procesar avería";
                        set({ isLoading: false, error: errorMessage }, false, "maquinas/procesar_averia_error");
                        throw e;
                    }
                },

                reset: () => set({ maquinas: [], reportesAveriaPendientes: [], isLoading: false, error: null }, false, "maquinas/reset"),
            },
        }),
        { name: "MaquinasStore" }
    )
);

// Hook helper para extraer acciones
export const useMaquinasActions = () => useMaquinasStore((state) => state.actions);// trigger reload
