"use client";
"use no memo";

import { OrdenCompraFormData, ordenCompraSchema } from "@/features/ordenes-compra/schemas/ordenes-compra.schemas";
import { useOrdenesCompraStore } from "@/features/ordenes-compra/store/useOrdenesCompraStore";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { AppColors } from "@/shared/constants";
import { OrdenCompra } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNotificationActions } from "@/shared/store/useNotificationStore";

export function ModalGestionOrdenCompra({ ordenEditando, onClose }: { onClose: () => void; ordenEditando?: OrdenCompra; }) {
    const isEdit = !!ordenEditando;
    const { createOrdenCompra, updateOrdenCompra } = useOrdenesCompraStore();
    const { insumos } = useInsumosStore();
    const { fetchInsumos } = useInsumosActions();
    const { addToastOnly } = useNotificationActions();

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<OrdenCompraFormData>({
        resolver: zodResolver(ordenCompraSchema),
        defaultValues: {
            numero: `OC-${new Date().getFullYear()}-`,
            proveedor: "",
            estado: "PENDIENTE",
            notas: "",
            lineas: [{ insumo_id: "", cantidad: 1, precio_unitario: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "lineas" });

    useEffect(() => {
        fetchInsumos();
    }, [fetchInsumos]);

    useEffect(() => {
        if (ordenEditando) {
            reset({
                ...ordenEditando,
                lineas: ordenEditando.lineas.map(l => ({
                    id: l.id,
                    insumo_id: l.insumo_id,
                    cantidad: l.cantidad,
                    precio_unitario: l.precio_unitario || 0
                }))
            });
        }
    }, [ordenEditando, reset]);

    const onSubmit = async (data: OrdenCompraFormData) => {
        try {
            if (isEdit && ordenEditando.id) {
                await updateOrdenCompra(ordenEditando.id, data);
                addToastOnly("Orden Actualizada", "La orden de compra fue actualizada correctamente.", "success");
            } else {
                await createOrdenCompra(data);
                addToastOnly("Orden Creada", "La orden de compra fue creada correctamente.", "success");
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
                            {isEdit ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
                        </h2>
                        <p className="text-sm text-[#94a3b8] mt-1">
                            {isEdit ? "Modifique los datos de la orden." : "Ingrese los datos del proveedor y los insumos solicitados."}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#1a1e2b] transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="orden-compra-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Datos Básicos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Proveedor</label>
                                <input
                                    {...register("proveedor")}
                                    className="w-full bg-[#1a1e2b] border border-[#1e2130] rounded-xl px-4 py-3 text-sm text-white focus:border-[#f97316] outline-none transition-all"
                                    placeholder="Nombre del proveedor"
                                />
                                {errors.proveedor && <p className="text-red-400 text-xs font-bold mt-1">{errors.proveedor.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Notas Adicionales</label>
                                <textarea
                                    {...register("notas")}
                                    rows={1}
                                    className="w-full bg-[#1a1e2b] border border-[#1e2130] rounded-xl px-4 py-3 text-sm text-white focus:border-[#f97316] outline-none transition-all resize-none"
                                    placeholder="Condiciones de pago, envío, etc."
                                />
                            </div>
                        </div>

                        {/* Líneas de Insumos */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-white">Insumos Solicitados</h3>
                                <button
                                    type="button"
                                    onClick={() => append({ insumo_id: "", cantidad: 1, precio_unitario: 0 })}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 transition-colors text-xs font-bold"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Agregar Insumo
                                </button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-[#1a1e2b] border border-[#1e2130] relative group">
                                        <div className="md:col-span-6 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Insumo</label>
                                            <select
                                                {...register(`lineas.${index}.insumo_id`)}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none"
                                            >
                                                <option value="">Seleccione un insumo</option>
                                                {insumos.map(ins => (
                                                    <option key={ins.id} value={ins.id}>
                                                        {`${ins.nombre} (${ins.codigo || 'S/N'}) - Unidad: ${ins.unidad}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.lineas?.[index]?.insumo_id && <p className="text-red-400 text-[10px]">{errors.lineas[index]?.insumo_id?.message}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Cantidad</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="0.01"
                                                {...register(`lineas.${index}.cantidad`, { valueAsNumber: true })}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Total Estimado</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...register(`lineas.${index}.precio_unitario`, { valueAsNumber: true })}
                                                className="w-full bg-[#13161e] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] outline-none"
                                            />
                                        </div>
                                        
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
                                    </div>
                                ))}
                                {errors.lineas?.root && <p className="text-red-400 text-xs font-bold mt-1">{errors.lineas.root.message}</p>}
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-5 border-t border-[#1e2130] flex items-center justify-end gap-3 bg-[#13161e] rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#94a3b8] hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="orden-compra-form"
                        className="px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        style={{ background: `linear-gradient(135deg, ${AppColors.emerald}, #ea580c)` }}
                    >
                        {isEdit ? "Guardar Cambios" : "Crear Orden de Compra"}
                    </button>
                </div>
            </div>
        </div>
    );
}
