"use client";

import { OrdenFormData, ordenSchema } from "@/features/ordenes/schemas/ordenes.schemas";
import { AppColors } from "@/shared/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

// ── Modal nueva orden ──────────────────────────────────────

export function ModalGestionOrdenes({ onClose }: { onClose: () => void }) {
    const { register, handleSubmit, watch, setValue, reset, getValues, formState: { errors } } = useForm<OrdenFormData>({
        resolver: zodResolver(ordenSchema),
        defaultValues: {
            tipo: "MTO",
            prioridad: "normal",
            cliente: "",
            numero: "ORD-" + new Date().getFullYear() + "-",
            estado: "pendiente",
            lineas: [],
            fechaCreacion: new Date().toISOString(),
            fechaEntregaEstimada: ""
        }
    });

    const vTipo = watch("tipo");
    const vCliente = watch("cliente");
    const vFechaEntrega = watch("fechaEntregaEstimada");
    const vDescripcion = watch("lineas.0.descripcion");
    const vCantidad = watch("lineas.0.cantidad");

    const onActualSubmit = (data: OrdenFormData) => {
        console.log("Datos listos para enviar:", data);
        // Aquí llamarías a tu acción del store o API
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>

            <form onSubmit={handleSubmit(onActualSubmit)}
                className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: AppColors.border }}>
                    <h2 className="font-bold text-white">Nueva Orden de Producción</h2>
                    <button type="button" onClick={onClose} style={{ color: AppColors.slate }}><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Tipo MTO / MTS */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Tipo de Orden</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["MTO", "MTS"] as const).map(t => (
                                <button
                                    key={t}
                                    type="button" // Evita que dispare el submit
                                    onClick={() => setValue("tipo", t)}
                                    className="py-3 rounded-xl border-2 font-bold text-sm transition-all"
                                    style={{
                                        borderColor: vTipo === t ? AppColors.orange : AppColors.border,
                                        color: vTipo === t ? AppColors.orange : "#94a3b8",
                                        background: vTipo === t ? `${AppColors.orange}12` : "transparent",
                                    }}>
                                    {t === "MTO" ? "MTO — Pedido cliente" : "MTS — Stock interno"}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px]" style={{ color: AppColors.slate }}>
                            {vTipo === "MTO"
                                ? "Prioridad sobre órdenes MTS. Fecha de entrega comprometida."
                                : "Producción para inventario. Puede pausarse por MTO urgente."}
                        </p>
                    </div>

                    {/* Cliente / Descripción */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
                            {vTipo === "MTO" ? "Cliente" : "Descripción"}
                        </label>
                        <input
                            {...register("cliente")}
                            placeholder={vTipo === "MTO" ? "Nombre del cliente" : "Ej: Stock temporada alta"}
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none transition-all"
                            style={{
                                background: "#0d1018",
                                border: `1.5px solid ${vCliente ? AppColors.orange : AppColors.border}`
                            }}
                        />
                        {errors.cliente && <p className="text-[10px] text-red-400">{errors.cliente.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Prenda */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Tipo de prenda</label>
                            <div className="relative">
                                <select
                                    {...register("lineas.0.descripcion")}
                                    className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                                    style={{
                                        background: "#0d1018",
                                        border: `1.5px solid ${vDescripcion ? AppColors.orange : AppColors.border}`
                                    }}>
                                    <option value="">— Selecciona —</option>
                                    {["Licra deportiva", "Jogger", "Vestido", "T-shirt", "Short", "Blusa", "Otro"].map(p =>
                                        <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Cantidad */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Cantidad (piezas)</label>
                            <input
                                type="number"
                                {...register("lineas.0.cantidad", { valueAsNumber: true })}
                                placeholder="100"
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{
                                    background: "#0d1018",
                                    border: `1.5px solid ${vCantidad > 0 ? AppColors.orange : AppColors.border}`
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Prioridad */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Prioridad</label>
                            <select
                                {...register("prioridad")}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none transition-all"
                                style={{ background: "#0d1018", border: `1.5px solid ${AppColors.border}` }}>
                                {["baja", "normal", "alta", "urgente"].map(p =>
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                            </select>
                        </div>

                        {/* Fecha entrega */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Fecha de entrega</label>
                            <input
                                type="date"
                                {...register("fechaEntregaEstimada")}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{
                                    background: "#0d1018",
                                    border: `1.5px solid ${vFechaEntrega ? AppColors.orange : AppColors.border}`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Acciones */}
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl border text-sm font-semibold cursor-pointer hover:scale-105 transition-transform"
                        style={{ borderColor: AppColors.border, color: "#94a3b8" }}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 h-11 rounded-xl text-white text-sm font-bold cursor-pointer hover:scale-105 transition-transform"
                        style={{
                            background: AppColors.orange,
                            boxShadow: `0 4px 16px ${AppColors.orange}40`
                        }}>
                        Crear Orden
                    </button>
                </div>
            </form>
        </div>
    );
}