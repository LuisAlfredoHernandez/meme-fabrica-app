"use client";
"use no memo";

import { OrdenVentaFormData, ordenVentaSchema } from "@/features/ordenes-venta/schemas/ordenes-venta.schemas";
import { useOrdenesVentaStore } from "@/features/ordenes-venta/store/useOrdenesVentaStore";
import { AppColors } from "@/shared/constants";
import { OrdenVenta } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNotificationActions } from "@/shared/store/useNotificationStore";

export function ModalGestionOrdenVenta({ ordenEditando, onClose, readOnly = false }: { onClose: () => void; ordenEditando?: OrdenVenta; readOnly?: boolean }) {
    const isEdit = !!ordenEditando;
    const { createOrdenVenta, updateOrdenVenta } = useOrdenesVentaStore();
    const { addToastOnly } = useNotificationActions();
    const [focusedColorIndex, setFocusedColorIndex] = useState<number | null>(null);
    const COLORES_SUGERIDOS = ["Negro", "Blanco", "Azul Marino", "Gris", "Rojo", "Verde", "Amarillo", "Rosa", "Naranja", "Beige", "Celeste", "Vino"];

    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<OrdenVentaFormData>({
        resolver: zodResolver(ordenVentaSchema),
        defaultValues: {
            numero: `OV-${new Date().getFullYear()}-`,
            cliente: "",
            estado: "EN_ESPERA",
            prioridad: "normal",
            fecha_entrega_estimada: "",
            notas: "",
            lineas: [{ descripcion: "", cantidad: 1, talla: "M", color: "", precio_unitario: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "lineas" });
    const vLineas = watch("lineas");

    useEffect(() => {
        if (ordenEditando) {
            reset({
                ...ordenEditando,
                fecha_entrega_estimada: ordenEditando.fecha_entrega_estimada ? ordenEditando.fecha_entrega_estimada.split("T")[0] : "",
                lineas: ordenEditando.lineas.map(l => ({
                    id: l.id,
                    descripcion: l.descripcion,
                    talla: l.talla,
                    color: l.color || "",
                    cantidad: l.cantidad,
                    precio_unitario: l.precio_unitario || 0
                }))
            });
        }
    }, [ordenEditando, reset]);

    const onSubmit = async (data: OrdenVentaFormData) => {
        try {
            if (isEdit && ordenEditando.id) {
                await updateOrdenVenta(ordenEditando.id, data);
                addToastOnly("Orden Actualizada", "La orden de venta fue actualizada correctamente.", "success");
            } else {
                await createOrdenVenta(data);
                addToastOnly("Orden Creada", "La orden de venta fue creada correctamente.", "success");
            }
            onClose();
        } catch (error: any) {
            addToastOnly("Error", error.message || "No se pudo guardar la orden.", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#13161e] border border-[#1e2130] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-[#1e2130]">
                    <div>
                        <h2 className="text-xl font-black text-white">
                            {readOnly ? "Detalles de la Orden de Venta" : isEdit ? "Editar Orden de Venta" : "Nueva Orden de Venta"}
                        </h2>
                        <p className="text-sm text-[#94a3b8] mt-1">
                            {readOnly ? "Vista de solo lectura." : isEdit ? "Modifique los datos de la orden." : "Ingrese los datos del cliente y las prendas requeridas."}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#1a1e2b] transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="orden-venta-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Datos Básicos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Cliente</label>
                                <input
                                    {...register("cliente")}
                                    disabled={readOnly}
                                    className="w-full bg-[#1a1e2b] border border-[#1e2130] rounded-xl px-4 py-3 text-sm text-white focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] outline-none transition-all disabled:opacity-50"
                                    placeholder="Nombre del cliente"
                                />
                                {errors.cliente && <p className="text-red-400 text-xs font-bold mt-1">{errors.cliente.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Fecha de Entrega</label>
                                <input
                                    type="date"
                                    {...register("fecha_entrega_estimada")}
                                    disabled={readOnly}
                                    className="w-full bg-[#1a1e2b] border border-[#1e2130] rounded-xl px-4 py-3 text-sm text-white focus:border-[#f97316] outline-none transition-all disabled:opacity-50"
                                />
                                {errors.fecha_entrega_estimada && <p className="text-red-400 text-xs font-bold mt-1">{errors.fecha_entrega_estimada.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Prioridad</label>
                                <select
                                    {...register("prioridad")}
                                    disabled={readOnly}
                                    className="w-full bg-[#1a1e2b] border border-[#1e2130] rounded-xl px-4 py-3 text-sm text-white focus:border-[#f97316] outline-none transition-all disabled:opacity-50"
                                >
                                    <option value="baja">Baja</option>
                                    <option value="normal">Normal</option>
                                    <option value="alta">Alta</option>
                                    <option value="urgente">Urgente</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Notas Adicionales</label>
                                <textarea
                                    {...register("notas")}
                                    rows={2}
                                    disabled={readOnly}
                                    className="w-full bg-[#1a1e2b] border border-[#1e2130] rounded-xl px-4 py-3 text-sm text-white focus:border-[#f97316] outline-none transition-all resize-none disabled:opacity-50"
                                    placeholder="Comentarios o especificaciones generales"
                                />
                            </div>
                        </div>

                        {/* Líneas de Prendas */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-white">Prendas / Productos</h3>
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => append({ descripcion: "", cantidad: 1, talla: "M", color: "", precio_unitario: 0 })}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 transition-colors text-xs font-bold"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Agregar Prenda
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-[#1a1e2b] border border-[#1e2130] relative group">
                                        <div className="md:col-span-3 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Descripción</label>
                                            <input
                                                {...register(`lineas.${index}.descripcion`)}
                                                disabled={readOnly}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none disabled:opacity-50"
                                                placeholder="Ej: Licra deportiva"
                                            />
                                            {errors.lineas?.[index]?.descripcion && <p className="text-red-400 text-[10px]">{errors.lineas[index]?.descripcion?.message}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Talla</label>
                                            <select
                                                {...register(`lineas.${index}.talla`)}
                                                disabled={readOnly}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none disabled:opacity-50"
                                            >
                                                {["XS", "S", "M", "L", "XL", "MIXTA", "PREDETERMINADA"].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1 relative">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Color</label>
                                            <input
                                                type="text"
                                                {...register(`lineas.${index}.color`)}
                                                disabled={readOnly}
                                                onFocus={() => setFocusedColorIndex(index)}
                                                onBlur={() => setFocusedColorIndex(null)}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none disabled:opacity-50 relative z-10"
                                                placeholder="Rojo, Azul..."
                                                autoComplete="off"
                                            />
                                            {focusedColorIndex === index && !readOnly && (
                                                <div className="absolute left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto bg-[#13161e] border border-[#1e2130] rounded-xl z-50 shadow-2xl custom-scrollbar">
                                                    {COLORES_SUGERIDOS
                                                        .filter(c => {
                                                            const val = vLineas?.[index]?.color || "";
                                                            return c.toLowerCase().includes(val.toLowerCase());
                                                        })
                                                        .map(c => (
                                                            <button
                                                                key={c}
                                                                type="button"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    setValue(`lineas.${index}.color`, c);
                                                                    setFocusedColorIndex(null);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-orange-500/10 hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                {c}
                                                            </button>
                                                        ))}
                                                    {vLineas?.[index]?.color && !COLORES_SUGERIDOS.map(c => c.toLowerCase()).includes((vLineas[index]?.color || "").toLowerCase()) && (
                                                        <div className="px-3 py-1.5 text-[9px] text-slate-500 border-t border-[#1e2130]">
                                                            Usa el color escrito: "{vLineas[index]?.color}"
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Cantidad</label>
                                            <input
                                                type="number"
                                                min="1"
                                                {...register(`lineas.${index}.cantidad`, { valueAsNumber: true })}
                                                disabled={readOnly}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Precio</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...register(`lineas.${index}.precio_unitario`, { valueAsNumber: true })}
                                                disabled={readOnly}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none disabled:opacity-50"
                                            />
                                        </div>
                                        
                                        {!readOnly && (
                                            <div className="md:col-span-1 flex items-end justify-center pb-1">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                    className={`p-2 rounded-lg transition-colors ${fields.length === 1 ? 'opacity-50 cursor-not-allowed text-slate-600' : 'text-red-400 bg-red-500/10 hover:bg-red-500/20'}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-5 border-t border-[#1e2130] flex items-center justify-end gap-3 bg-[#13161e] rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#94a3b8] hover:text-white transition-colors">
                        {readOnly ? "Cerrar" : "Cancelar"}
                    </button>
                    {!readOnly && (
                        <button
                            type="submit"
                            form="orden-venta-form"
                            className="px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                            style={{ background: `linear-gradient(135deg, ${AppColors.orange}, #ea580c)` }}
                        >
                            {isEdit ? "Guardar Cambios" : "Crear Orden de Venta"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
