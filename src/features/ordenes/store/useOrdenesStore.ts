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

                updateCola: async (ordenesReordenadas: Orden[]) => {
                    // 1. Actualización inmediata de la UI (Optimistic Update)
                    // Esto hace que el drag and drop se sienta instantáneo
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
                        // 2. Sincronizar con el servicio (Llamadas en paralelo)
                        // Solo enviamos el ID y el nuevo número de cola
                        await Promise.all(
                            ordenesReordenadas.map((o) =>
                                ordenesService.update(o.id, { cola: o.cola })
                            )
                        );
                    } catch (e) {
                        // 3. Opcional: Revertir o manejar error si la API falla
                        console.error("Error al sincronizar la cola con la DB", e);
                        // Podrías llamar a fetchOrdenes() aquí para recuperar el estado real
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