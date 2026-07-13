import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
    fetchOrdenesAction,
    createOrdenAction,
    updateOrdenAction,
    deleteOrdenAction
} from "@/features/ordenes/actions/ordenes.actions";
import type { Orden } from "@/types";

interface OrdenState {
    ordenes: Orden[];
    isLoading: boolean;
    error: string | null;
    actions: {
        fetchOrdenes: () => Promise<void>;
        createOrden: (data: Omit<Orden, "id">) => Promise<boolean>;
        updateOrden: (id: string, data: Partial<Orden>) => Promise<boolean>;
        updateCola: (ordenesReordenadas: Orden[]) => Promise<void>;
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
                        const data = await fetchOrdenesAction();
                        set({ ordenes: data, isLoading: false }, false, "ordenes/fetch_success");
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : "Error desconocido";
                        set({ isLoading: false, error: errorMessage }, false, "ordenes/fetch_error");
                    }
                },

                createOrden: async (newOrdenData) => {
                    set({ isLoading: true, error: null }, false, "ordenes/create_start");
                    try {
                        const created = await createOrdenAction(newOrdenData);

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
                        throw e;
                    }
                },

                updateOrden: async (id, data) => {
                    set({ isLoading: true, error: null }, false, "ordenes/update_start");
                    try {
                        const updated = await updateOrdenAction(id, data);

                        // Mapeamos el array actual para reemplazar solo el elemento editado
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
                        throw e;
                    }
                },

                updateCola: async (ordenesReordenadas: Orden[]) => {
                    // 1. Actualización inmediata de la UI (Optimistic Update)
                    set(
                        (state) => ({
                            ordenes: state.ordenes.map((original) => {
                                const nuevaInfo = ordenesReordenadas.find((n) => n.id === original.id);
                                return nuevaInfo ? { ...original, cola: nuevaInfo.cola } : original;
                            }),
                        }),
                        false,
                        "ordenes/update_cola_optimistic"
                    );

                    try {
                        // 2. Sincronizar con el servicio a través de Server Actions en paralelo
                        await Promise.all(
                            ordenesReordenadas.map((o) =>
                                updateOrdenAction(o.id, { cola: o.cola })
                            )
                        );
                    } catch (e) {
                        console.error("Error al sincronizar la cola con la DB", e);
                        // Opcional: recargar datos reales si hay error
                        const data = await fetchOrdenesAction();
                        set({ ordenes: data }, false, "ordenes/update_cola_rollback");
                    }
                },

                deleteOrden: async (id) => {
                    set({ isLoading: true, error: null }, false, "ordenes/delete_start");
                    try {
                        await deleteOrdenAction(id);
                        set((state) => ({
                            ordenes: state.ordenes.filter(i => i.id !== id),
                            isLoading: false
                        }), false, "ordenes/delete_success");
                        return true;
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : "Error al eliminar";
                        set({ isLoading: false, error: errorMessage }, false, "ordenes/delete_error");
                        throw e;
                    }
                },

                reset: () => set({ ordenes: [], isLoading: false, error: null }, false, "ordenes/reset"),
            },
        }),
        { name: "OrdenesStore" }
    )
);

export const useOrdenActions = () => useOrdenStore((state) => state.actions);