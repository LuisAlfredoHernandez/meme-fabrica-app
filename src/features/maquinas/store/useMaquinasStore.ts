import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { maquinasService } from "@/features/maquinas/services/maquinas.service";
import { Maquina } from "@/types";

interface MaquinasState {
    maquinas: Maquina[];
    isLoading: boolean;
    error: string | null;
    actions: {
        fetchMaquinas: () => Promise<void>;
        createMaquina: (data: Omit<Maquina, "id">) => Promise<boolean>;
        updateMaquina: (id: string, data: Partial<Maquina>) => Promise<boolean>;
        reset: () => void;
    };
}

export const useMaquinasStore = create<MaquinasState>()(
    devtools(
        (set) => ({
            maquinas: [],
            isLoading: false,
            error: null,

            actions: {
                fetchMaquinas: async () => {
                    set({ isLoading: true, error: null }, false, "maquinas/fetch_start");
                    try {
                        const data = await maquinasService.getAll();
                        set({ maquinas: data, isLoading: false }, false, "maquinas/fetch_success");
                    } catch (e) {
                        set({ isLoading: false, error: "Error al cargar máquinas" }, false, "maquinas/fetch_error");
                    }
                },

                createMaquina: async (data) => {
                    set({ isLoading: true }, false, "maquinas/create_start");
                    try {
                        const nueva = await maquinasService.create(data);
                        set(
                            (state) => ({ maquinas: [...state.maquinas, nueva], isLoading: false }),
                            false,
                            "maquinas/create_success"
                        );
                        return true;
                    } catch (e) {
                        set({ isLoading: false, error: "Error al crear máquina" }, false, "maquinas/create_error");
                        return false;
                    }
                },

                updateMaquina: async (id, data) => {
                    set({ isLoading: true }, false, "maquinas/update_start");
                    try {
                        const actualizada = await maquinasService.update(id, data);
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
                        set({ isLoading: false, error: "Error al actualizar" }, false, "maquinas/update_error");
                        return false;
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