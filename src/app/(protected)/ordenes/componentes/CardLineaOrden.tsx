"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { Insumo } from "@/types";
import { LineaInsumos } from "./LineaInsumos";

interface CardLineaOrdenProps {
    index: number;
    register: any;
    errors: any;
    control: any;
    setValue: any;
    readOnly: boolean;
    vLineas: any;
    listaPrendas: string[];
    insumos: Insumo[];
    onRemove: () => void;
    showRemoveButton: boolean;
}

export function CardLineaOrden({
    index,
    register,
    errors,
    control,
    setValue,
    readOnly,
    vLineas,
    listaPrendas,
    insumos,
    onRemove,
    showRemoveButton
}: CardLineaOrdenProps) {
    const [isColorFocused, setIsColorFocused] = useState(false);
    const COLORES_SUGERIDOS = ["Negro", "Blanco", "Azul Marino", "Gris", "Rojo", "Verde", "Amarillo", "Rosa", "Naranja", "Beige", "Celeste", "Vino"];

    return (
        <div className="p-4 rounded-2xl border space-y-4 transition-all duration-300 hover:bg-white/[0.02]"
            style={{ borderColor: AppColors.border, background: "rgba(255,255,255,0.01)" }}>

            <div className="flex gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="ej: Camiseta, Jogger..."
                        list={`prendas-datalist-${index}`}
                        {...register(`lineas.${index}.descripcion`)}
                        className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/20 focus:outline-none transition-all placeholder-slate-600 focus:border-orange-500/50"
                        style={{ border: `1.5px solid ${errors.lineas?.[index]?.descripcion ? AppColors.red : (vLineas[index]?.descripcion ? AppColors.orange : AppColors.border)}` }}
                        autoComplete="off"
                    />
                    {errors.lineas?.[index]?.descripcion && (
                        <p className="text-xs text-red-400 mt-1">{errors.lineas[index]?.descripcion?.message}</p>
                    )}
                    <datalist id={`prendas-datalist-${index}`}>
                        {listaPrendas.map(p => <option key={p} value={p} />)}
                    </datalist>
                </div>

                {!readOnly && showRemoveButton && (
                    <button type="button" onClick={onRemove}
                        className="flex items-center justify-center rounded-xl bg-[#0d1018] text-slate-600 hover:bg-red-400 transition-all duration-300 group cursor-pointer">
                        <Trash2 className="w-10 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Talla</span>
                    <select {...register(`lineas.${index}.talla`)}
                        className="w-full h-10 px-2 rounded-xl text-xs text-white bg-black/20 border border-[#1e2130] focus:border-orange-500/50 outline-none">
                        {["XS", "S", "M", "L", "XL", "MIXTA", "PREDETERMINADA"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="space-y-1 relative">
                    <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Color</span>
                    <input
                        type="text"
                        placeholder="ej: Negro"
                        {...register(`lineas.${index}.color`)}
                        onFocus={() => setIsColorFocused(true)}
                        onBlur={() => setIsColorFocused(false)}
                        className="w-full h-10 px-3 rounded-xl text-white text-xs bg-black/20 focus:outline-none placeholder-slate-600 border focus:border-orange-500/50"
                        style={{ borderColor: AppColors.border }}
                        autoComplete="off"
                    />

                    {isColorFocused && (
                        <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-[#13161e] border border-[#1e2130] rounded-xl z-50 shadow-2xl custom-scrollbar">
                            {COLORES_SUGERIDOS
                                .filter(c => {
                                    const val = vLineas[index]?.color || "";
                                    return c.toLowerCase().includes(val.toLowerCase());
                                })
                                .map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setValue(`lineas.${index}.color`, c);
                                            setIsColorFocused(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-orange-500/10 hover:text-white transition-colors cursor-pointer"
                                    >
                                        {c}
                                    </button>
                                ))}
                            {/* Opción para sugerir que sigan escribiendo */}
                            {vLineas[index]?.color && !COLORES_SUGERIDOS.map(c => c.toLowerCase()).includes((vLineas[index]?.color || "").toLowerCase()) && (
                                <div className="px-3 py-1.5 text-[9px] text-slate-500 border-t border-[#1e2130]">
                                    Usa el color escrito: "{vLineas[index]?.color}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Cantidad</span>
                    <input type="number" min="1"
                        onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e" || e.key === "E") {
                                e.preventDefault();
                            }
                        }}
                        {...register(`lineas.${index}.cantidad`, { valueAsNumber: true })}
                        className="w-full h-10 px-3 rounded-xl text-white text-xs bg-black/20 focus:outline-none"
                        style={{ border: `1.5px solid ${errors.lineas?.[index]?.cantidad ? AppColors.red : (vLineas[index]?.cantidad > 0 ? AppColors.orange : AppColors.border)}` }} />
                    {errors.lineas?.[index]?.cantidad && (
                        <p className="text-[10px] text-red-400 mt-1">{errors.lineas[index]?.cantidad?.message}</p>
                    )}
                </div>
            </div>

            <LineaInsumos
                lineIndex={index}
                control={control}
                register={register}
                readOnly={readOnly}
                insumosDisponibles={insumos}
                setValue={setValue}
                watchLine={vLineas?.[index]?.insumos}
            />
        </div>
    );
}
