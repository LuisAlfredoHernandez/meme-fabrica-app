"use client";

import { OrdenFormData, ordenSchema } from "@/features/ordenes/schemas/ordenes.schemas";
import { useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { AppColors } from "@/shared/constants";
import { Orden } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2, Calendar } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";


export function ModalGestionOrdenes({ orden, onClose }: { onClose: () => void, orden?: Orden; }) {
    const { register, handleSubmit, watch, setValue, control, getValues, formState: { errors } } = useForm<OrdenFormData>({
        resolver: zodResolver(ordenSchema),
        defaultValues: {
            tipo: "MTO",
            prioridad: "normal",
            cliente: "",
            numero: "ORD-" + new Date().getFullYear() + "-",
            estado: "pendiente",
            lineas: [{ descripcion: "", cantidad: 1, talla: "M", insumos: [] }],
            fechaCreacion: new Date().toISOString(),
            fechaEntregaEstimada: ""
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "lineas" });
    const { createOrden, updateOrden } = useOrdenActions()
    const isEdit = !!orden;

    const vTipo = watch("tipo");
    const vCliente = watch("cliente");
    const vFechaEntrega = watch("fechaEntregaEstimada");
    const vLineas = watch("lineas");


    const onActualSubmit = async (data: OrdenFormData) => {
        try {
            if (isEdit && orden?.id) {
                await updateOrden(orden.id, data as Orden);
                console.log("Orden actualizada exitosamente");
            } else {
                await createOrden(data as Orden);
                console.log("Orden creada exitosamente");
            }
            onClose();
        } catch (error) {
            console.error("Error al procesar la operación:", error);
        }
    };

    const onInvalidSubmit = (errors: unknown) => {
        console.error("🚨 Error de Validación en Formulario Operarios:", {
            timestamp: new Date().toISOString(),
            errors, // Aquí verás qué campo falló y por qué (Zod error messages)
            currentValues: getValues()
        });
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>

            <style>{`
                .order-items-scroll::-webkit-scrollbar { width: 5px; }
                .order-items-scroll::-webkit-scrollbar-track { background: transparent; }
                .order-items-scroll::-webkit-scrollbar-thumb { 
                    background: ${AppColors.border}; 
                    border-radius: 10px; 
                }
                .order-items-scroll::-webkit-scrollbar-thumb:hover { background: ${AppColors.orange}80; }
                
                /* Máscara de desvanecimiento para el scroll */
                .scroll-mask {
                    mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
                }
            `}</style>

            <form onSubmit={handleSubmit(onActualSubmit, onInvalidSubmit)}
                className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: AppColors.border }}>
                    <h2 className="font-bold text-white text-lg">Nueva Orden de Producción</h2>
                    <button type="button" onClick={onClose} style={{ color: AppColors.slate }}
                        className="hover:bg-red-500/10 hover:rotate-90 transition-transform duration-200 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-hidden flex-1 flex flex-col">
                    {/* Sección Fija: Datos Generales */}
                    <div className="space-y-4 shrink-0">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Tipo de Orden</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["MTO", "MTS"] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setValue("tipo", t)}
                                        className="py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer"
                                        style={{
                                            borderColor: vTipo === t ? AppColors.orange : AppColors.border,
                                            color: vTipo === t ? AppColors.orange : "#94a3b8",
                                            background: vTipo === t ? `${AppColors.orange}15` : "transparent",
                                        }}>
                                        {t === "MTO" ? "MTO — Pedido" : "MTS — Stock"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                                {vTipo === "MTO" ? "Cliente" : "Descripción del Lote"}
                            </label>
                            <input {...register("cliente")}
                                placeholder="..."
                                className="w-full h-11 px-4 rounded-xl text-white text-sm bg-black/20 focus:outline-none transition-all"
                                style={{ border: `1.5px solid ${vCliente ? AppColors.orange : AppColors.border}` }} />
                        </div>
                    </div>

                    {/* SECCIÓN DE PRENDAS (Con Scroll Homogéneo) */}
                    <div className="flex flex-col flex-1 min-h-0 space-y-3 relative">
                        <div className="flex justify-between items-center px-1 shrink-0">
                            <label className="text-[11px] font-black uppercase tracking-widest text-orange-500">Prendas / Items</label>
                            <button type="button" onClick={() => append({ descripcion: "", cantidad: 1, talla: "M", insumos: [] })}
                                className="group flex items-center justify-center p-1 rounded-lg border border-orange-500/30 hover:bg-orange-500/10 cursor-pointer transition-all">
                                <Plus className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Área de Scroll con Máscara Visual */}
                        <div className="flex-1 overflow-hidden relative scroll-mask">
                            <div className="order-items-scroll h-full overflow-y-auto pr-3 space-y-4 py-4" style={{ maxHeight: "320px" }}>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 rounded-2xl border space-y-4 transition-all duration-300 hover:bg-white/[0.02]"
                                        style={{ borderColor: AppColors.border, background: "rgba(255,255,255,0.01)" }}>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <select {...register(`lineas.${index}.descripcion`)}
                                                    className="w-full h-11 px-4 rounded-xl text-sm text-white appearance-none focus:outline-none bg-black/20 transition-all"
                                                    style={{ border: `1.5px solid ${vLineas[index]?.descripcion ? AppColors.orange : AppColors.border}` }}>
                                                    <option value="">— Selecciona Prenda —</option>
                                                    {["Licra deportiva", "Jogger", "Vestido", "T-shirt", "Short", "Blusa"].map(p =>
                                                        <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>

                                            {fields.length > 1 && (
                                                <button type="button" onClick={() => remove(index)}
                                                    className="flex items-center justify-center rounded-xl bg-[#0d1018] text-slate-600 hover:bg-red-400 transition-all duration-300 group cursor-pointer">
                                                    <Trash2 className="w-10 h-5 group-hover:scale-110 transition-transform" /> </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Talla</span>
                                                <select {...register(`lineas.${index}.talla`)}
                                                    className="w-full h-10 px-3 rounded-xl text-xs text-white bg-black/20 border border-[#1e2130] focus:border-orange-500/50 outline-none">
                                                    {["XS", "S", "M", "L", "XL"].map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Cantidad</span>
                                                <input type="number" {...register(`lineas.${index}.cantidad`, { valueAsNumber: true })}
                                                    className="w-full h-10 px-4 rounded-xl text-white text-xs bg-black/20 focus:outline-none"
                                                    style={{ border: `1.5px solid ${vLineas[index]?.cantidad > 0 ? AppColors.orange : AppColors.border}` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Interno: Prioridad y Fecha */}
                    <div className="grid grid-cols-2 gap-4 pt-2 shrink-0 border-t" style={{ borderColor: AppColors.border }}>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Prioridad</label>
                            <select {...register("prioridad")}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white bg-black/20 focus:outline-none border border-[#1e2130]">
                                {["baja", "normal", "alta", "urgente"].map(p =>
                                    <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5 shrink-0">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Fecha Entrega</label>
                            <div className="relative group">
                                <Calendar
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${vFechaEntrega ? 'text-orange-500' : 'text-slate-500'
                                        }`}
                                />

                                <input
                                    type="date"
                                    {...register("fechaEntregaEstimada")}
                                    className="date-input-custom w-full h-11 pl-11 pr-4 rounded-xl text-white text-sm bg-black/20 focus:outline-none transition-all cursor-pointer"
                                    style={{
                                        border: `1.5px solid ${vFechaEntrega ? AppColors.orange : AppColors.border}`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Principal */}
                <div className="flex gap-3 px-6 py-6 border-t shrink-0 bg-black/40" style={{ borderColor: AppColors.border }}>
                    <button type="button" onClick={onClose}
                        className="flex-1 h-12 rounded-xl border border-white/5 text-sm font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
                        CANCELAR
                    </button>
                    <button type="submit"
                        className="flex-[2] h-12 rounded-xl text-white text-xs font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                        style={{ background: AppColors.orange, boxShadow: `0 8px 24px -8px ${AppColors.orange}60` }}>
                        CONFIRMAR ORDEN
                    </button>
                </div>
            </form>
        </div>
    );
}