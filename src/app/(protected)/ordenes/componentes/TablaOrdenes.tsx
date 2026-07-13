"use client";

import {
    Clock, ArrowUpDown, Pause, CheckCircle2, Package,
    Edit3,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { Orden, EstadoOrden, Prioridad } from "@/types";
import { AppColors } from "@/shared/constants";
import { useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { useState } from "react";
import { ModalGestionOrdenes } from "./ModalGestionOrdenes";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { formatLocalDate } from "@/utils/formatters";

// Configuraciones visuales internas del componente
const ESTADO_CFG: Record<EstadoOrden, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pendiente: { label: "Pendiente", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    en_proceso: { label: "En proceso", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    pausada: { label: "Pausada", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <Pause className="w-3.5 h-3.5" /> },
    completada: { label: "Completada", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    cancelada: { label: "Cancelada", color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const ESTADOS: EstadoOrden[] = ["pendiente", "en_proceso", "pausada", "completada"];

const PRIORIDAD_CFG: Record<Prioridad, { color: string }> = {
    baja: { color: "#64748b" },
    normal: { color: "#94a3b8" },
    alta: { color: "#fbbf24" },
    urgente: { color: "#f87171" },
};

export function TablaOrdenes({ ordenes }: { ordenes: Orden[] }) {
    const { updateOrden, deleteOrden } = useOrdenActions();
    const [ordenEditando, setOrdenEditando] = useState<Orden | null>(null);
    const { addToastOnly } = useNotificationActions();

    const handleEliminar = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.")) {
            try {
                await deleteOrden(id);
                addToastOnly("Orden Eliminada", "La orden fue eliminada exitosamente.", "success");
            } catch (error: any) {
                addToastOnly("Error de Eliminación", error.message || "No se pudo eliminar la orden.", "error");
            }
        }
    };

    const cambiarEstadoRapido = async (id: string, nuevoEstado: EstadoOrden, ordenCompleta: Orden) => {
        try {
            await updateOrden(id, { ...ordenCompleta, estado: nuevoEstado });
            addToastOnly("Estado Actualizado", `Orden cambiada a ${nuevoEstado.toUpperCase()}.`, "success");
        } catch (error: any) {
            addToastOnly("Error de Actualización", error.message || "No se pudo cambiar el estado.", "error");
        }
    };

    return (
        <>
            {ordenEditando && (
                <ModalGestionOrdenes
                    orden={ordenEditando}
                    onClose={() => setOrdenEditando(null)}
                />
            )}

            <div className="rounded-2xl overflow-auto max-h-[550px] custom-scrollbar" style={{ border: `1px solid ${AppColors.border}` }}>
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10" style={{ background: AppColors.surface }}>
                        <tr>
                            {["Orden / Cliente", "Tipo", "Prenda", "Avance", "Estado", "Prioridad", "Fecha", "Acciones"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: AppColors.slate, background: AppColors.surface }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.map((o, i) => {
                            const totalCant = o.lineas.reduce((acc, l) => acc + l.cantidad, 0);
                            const totalComp = o.lineas.reduce((acc, l) => acc + (l.cantidadCompletada ?? 0), 0);
                            const pct = totalCant > 0 ? Math.round((totalComp / totalCant) * 100) : 0;
                            const descripcionPrenda = o.lineas.length > 1
                                ? `${o.lineas[0].descripcion} (+${o.lineas.length - 1})`
                                : o.lineas[0]?.descripcion || "Sin descripción";

                            const est = ESTADO_CFG[o.estado];
                            const prio = PRIORIDAD_CFG[o.prioridad];

                            return (
                                <tr key={o.id} className="border-t transition-colors hover:opacity-90"
                                    style={{
                                        borderColor: AppColors.border,
                                        background: i % 2 === 0 ? AppColors.bg : `${AppColors.surface}80`
                                    }}>
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-xs font-bold" style={{ color: AppColors.orange }}>{o.numero}</p>
                                        <p className="text-xs text-white mt-0.5">{o.cliente}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                                            style={{
                                                background: o.tipo === "MTO" ? "rgba(129,140,248,0.15)" : "rgba(100,116,139,0.15)",
                                                color: o.tipo === "MTO" ? "#818cf8" : "#94a3b8"
                                            }}>{o.tipo}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-white">{descripcionPrenda}</td>
                                    <td className="px-4 py-3 min-w-32">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, background: pct >= 100 ? AppColors.emerald : AppColors.orange }} />
                                            </div>
                                            <span className="text-xs font-mono" style={{ color: pct >= 100 ? AppColors.emerald : "#94a3b8" }}>
                                                {totalComp}/{totalCant}
                                            </span>
                                        </div>
                                    </td>

                                    {/* SELECTOR DE ESTADO RÁPIDO */}
                                    <td className="px-4 py-4">
                                        <select
                                            value={o.estado}
                                            onChange={(e) => cambiarEstadoRapido(o.id, e.target.value as EstadoOrden, o)}
                                            className="bg-transparent text-xs font-bold outline-none cursor-pointer transition-colors hover:brightness-125"
                                            style={{ color: est.color }}
                                        >
                                            {ESTADOS.map(e => (
                                                <option key={e} value={e} className="bg-[#11141b] text-white">
                                                    {ESTADO_CFG[e].label.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold capitalize" style={{ color: prio.color }}>{o.prioridad}</span>
                                    </td>

                                    <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
                                        {formatLocalDate(o.fechaEntregaEstimada)}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setOrdenEditando(o)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                                title="Editar Orden Completa"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(o.id)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                title="Eliminar Orden"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {ordenes.length === 0 && (
                    <div className="py-12 text-center" style={{ color: AppColors.slate }}>
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No se encontraron órdenes con estos filtros</p>
                    </div>
                )}
            </div>
        </>
    );
}