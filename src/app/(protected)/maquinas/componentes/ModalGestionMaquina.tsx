"use client";
import { MaquinaFormData, maquinaSchema } from "@/features/maquinas/schemas/maquina.schema";
import { useMaquinasStore } from "@/features/maquinas/store/useMaquinasStore";
import { AppColors } from "@/shared/constants";
import { Maquina, MaquinaStatus } from "@/types";
import { normalizeText } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";

export function ModalGestionMaquina({ maquina, onClose }: { maquina?: Maquina, onClose: () => void }) {
    const { actions, maquinaTypes } = useMaquinasStore();

    const isExisting = !!maquina;
    const [query, setQuery] = useState("");

    const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<MaquinaFormData>({
        resolver: zodResolver(maquinaSchema),
        defaultValues: {
            nombre: maquina?.nombre || "",
            codigo: maquina?.codigo || "",
            estado: maquina?.estado || "inactiva",
            modelo: maquina?.modelo || "",
            serie: maquina?.serie || "",
            tipo: maquina?.tipo || undefined,
            capacidadPorHora: maquina?.capacidadPorHora || 0,
            horasUso: maquina?.horasUso || 0
        }
    });


    useEffect(() => {
        actions.fetchAllMaquinaTypes();
    }, [actions, actions.fetchAllMaquinaTypes]);


    const filteredMaquinarias = maquinaTypes.filter(maquina =>
        normalizeText(maquina).includes(normalizeText(query))
    ).slice(0, 10);


    // Observamos el estado para aplicar estilos visuales en los botones
    const estadoActual = watch("estado");
    const valorSelectorTipo = watch("tipo");

    const onActualSubmit = async (data: MaquinaFormData) => {
        console.log(data)
        try {
            if (isExisting && maquina.id) {
                await actions.updateMaquina(maquina.id, data as Maquina);
            } else {
                const { id, ...dataToCreate } = data;
                await actions.createMaquina(dataToCreate);
            }
            onClose();
        } catch (error) {
            console.error("Error en la operación:", error);
        }
    };

    const onInvalidSubmit = (errors: FieldErrors<MaquinaFormData>) => {
        console.error("🚨 Error de Validación:", { errors, currentValues: getValues() });
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border overflow-hidden shadow-2xl"
                style={{ background: AppColors.surface, borderColor: AppColors.border }}>

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: AppColors.border }}>
                    <h2 className="text-white font-bold text-lg">
                        {isExisting ? "Gestionar Máquina" : "Nueva Máquina"}
                    </h2>
                    <button onClick={onClose} style={{ color: AppColors.slate }}><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onActualSubmit, onInvalidSubmit)}>
                    <div className="p-6 space-y-4">
                        {/* Código Automático */}
                        <div className="p-3 rounded-xl border flex items-center justify-between"
                            style={{ background: "rgba(249,115,22,0.05)", borderColor: "rgba(249,115,22,0.2)" }}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Identificador</span>
                            <span className="font-mono text-orange-500 font-bold">{maquina?.id ?? `MAC-AUTO`}</span>
                        </div>

                        {/* Nombre y Descripción */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400">Nombre</label>
                            <input
                                {...register("nombre")}
                                placeholder="Ej: Recta Industrial"
                                className="w-full h-11 px-4 rounded-xl text-white text-sm bg-[#0d1018] border border-[#1e2130] focus:outline-none focus:border-orange-500"
                            />
                            {errors.nombre && <span className="text-[10px] text-red-400">{errors.nombre.message}</span>}
                        </div>

                        {/* Estado de la Máquina - Select Estilizado */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400">Estado Operativo</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['activa', 'inactiva', 'depreciada'] as MaquinaStatus[]).map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setValue("estado", status)}
                                        className={`py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${estadoActual === status ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-[#1e2130] text-slate-500'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Modelo</label>
                                <input
                                    {...register("modelo")}
                                    className="w-full h-11 px-4 rounded-xl text-white text-sm bg-[#0d1018] border border-[#1e2130] focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Nº Serie</label>
                                <input
                                    {...register("serie")}
                                    className="w-full h-11 px-4 rounded-xl text-white text-sm bg-[#0d1018] border border-[#1e2130] focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Tipo</label>
                                <div className="relative">
                                    <select
                                        {...register("tipo")}
                                        className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none transition-all"
                                        style={{
                                            background: "#0d1018",
                                            border: `1.5px solid ${valorSelectorTipo ? AppColors.orange : AppColors.border}`,
                                        }}
                                    >
                                        <option value="">— Selecciona —</option>
                                        {maquinaTypes.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>

                                    {/* Pequeño indicador visual para el select (opcional) */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <span className="text-[8px]">▼</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Código</label>
                                <input
                                    {...register("codigo")}
                                    placeholder="Ej: M-001"
                                    className="w-full h-11 px-4 rounded-xl text-white text-sm bg-[#0d1018] transition-all focus:outline-none"
                                    style={{
                                        border: `1.5px solid ${watch("codigo") ? AppColors.orange : AppColors.border}`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-black/20 border-t flex gap-3" style={{ borderColor: AppColors.border }}>
                        <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border font-semibold text-slate-400" style={{ borderColor: AppColors.border }}>
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 h-12 rounded-xl text-white font-bold" style={{ background: AppColors.orange }}>
                            {isExisting ? "Guardar Cambios" : "Registrar Máquina"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}