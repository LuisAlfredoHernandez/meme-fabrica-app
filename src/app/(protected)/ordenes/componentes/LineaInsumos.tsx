"use client";

import { Insumo } from "@/types";
import { Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

interface LineaInsumosProps {
    lineIndex: number;
    control: any;
    register: any;
    readOnly: boolean;
    insumosDisponibles: Insumo[];
    setValue: any;
    watchLine: any;
}

export function LineaInsumos({
    lineIndex,
    control,
    register,
    readOnly,
    insumosDisponibles,
    setValue,
    watchLine
}: LineaInsumosProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `lineas.${lineIndex}.insumos`
    });

    return (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Insumos Necesarios</span>
                {!readOnly && (
                    <button
                        type="button"
                        onClick={() => append({ insumoId: "", cantidadRequerida: 0, unidad: "" })}
                        className="text-[9px] font-bold text-orange-500 hover:text-orange-400 transition-colors uppercase cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95 transition-all"
                    >
                        + Agregar Insumo
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {fields.map((field, insIndex) => {
                    const currentInsumoId = watchLine?.[insIndex]?.insumoId;
                    const currentUnidad = watchLine?.[insIndex]?.unidad || 
                                          insumosDisponibles.find(i => i.id === currentInsumoId)?.unidad || 
                                          "";

                    return (
                        <div key={field.id} className="flex gap-2.5 items-center bg-[#0d1018]/30 p-2 rounded-xl border border-white/[0.02]">
                            <select
                                {...register(`lineas.${lineIndex}.insumos.${insIndex}.insumoId`)}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const matched = insumosDisponibles.find(i => i.id === selectedId);
                                    if (matched) {
                                        setValue(`lineas.${lineIndex}.insumos.${insIndex}.unidad`, matched.unidad);
                                    }
                                }}
                                className="flex-[3] h-9 px-3 rounded-lg text-xs text-white bg-black/40 border border-[#1e2130] focus:border-orange-500/50 outline-none transition-all cursor-pointer"
                            >
                                <option value="" className="bg-[#11141b] text-slate-500">Seleccionar Insumo...</option>
                                {insumosDisponibles.map(ins => (
                                    <option key={ins.id} value={ins.id} className="bg-[#11141b] text-white">
                                        {ins.nombre}
                                    </option>
                                ))}
                            </select>

                            <div className="flex-[1.5] min-w-[70px]">
                                <input
                                    type="number"
                                    step="any"
                                    min="0.001"
                                    placeholder="Cant."
                                    onKeyDown={(e) => {
                                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register(`lineas.${lineIndex}.insumos.${insIndex}.cantidadRequerida`, { valueAsNumber: true })}
                                    className="w-full h-9 px-3 rounded-lg text-xs text-white bg-black/40 border border-[#1e2130] focus:border-orange-500/50 outline-none transition-all"
                                />
                            </div>

                            <div className="min-w-[72px] text-center">
                                <span className={`inline-block w-full text-[10px] font-bold px-2 py-1 rounded-lg border text-center select-none capitalize whitespace-nowrap ${currentUnidad ? 'text-slate-400 bg-white/5 border-white/10' : 'text-slate-600 bg-transparent border-[#1e2130]/50'}`}>
                                    {currentUnidad || "Unidad"}
                                </span>
                            </div>

                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => remove(insIndex)}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
