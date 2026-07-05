"use client";

import {
    Clock, ArrowUpDown, Pause, CheckCircle2, Edit3, Trash2, AlertTriangle
} from "lucide-react";
import { Orden, EstadoOrden, Prioridad } from "@/types";
import { AppColors } from "@/shared/constants";
import { formatLocalDate } from "@/utils/formatters";

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

interface FilaOrdenProps {
    orden: Orden;
    index: number;
    onEdit: (orden: Orden) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, nuevoEstado: EstadoOrden, ordenCompleta: Orden) => void;
}

export function FilaOrden({
    orden,
    index,
    onEdit,
    onDelete,
    onStatusChange
}: FilaOrdenProps) {
    const totalCant = orden.lineas.reduce((acc, l) => acc + l.cantidad, 0);
    const totalComp = orden.lineas.reduce((acc, l) => acc + (l.cantidadCompletada ?? 0), 0);
    const pct = totalCant > 0 ? Math.round((totalComp / totalCant) * 100) : 0;
    const descripcionPrenda = orden.lineas.length > 1
        ? `${orden.lineas[0].descripcion} (+${orden.lineas.length - 1})`
        : orden.lineas[0]?.descripcion || "Sin descripción";

    const est = ESTADO_CFG[orden.estado];
    const prio = PRIORIDAD_CFG[orden.prioridad];

    return (
        <tr className="border-t transition-colors hover:opacity-90"
            style={{
                borderColor: AppColors.border,
                background: index % 2 === 0 ? AppColors.bg : `${AppColors.surface}80`
            }}>
            <td className="px-4 py-3">
                <p className="font-mono text-xs font-bold" style={{ color: AppColors.orange }}>{orden.numero}</p>
                <p className="text-xs text-white mt-0.5">{orden.cliente}</p>
            </td>
            <td className="px-4 py-3">
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                        background: orden.tipo === "MTO" ? "rgba(129,140,248,0.15)" : "rgba(100,116,139,0.15)",
                        color: orden.tipo === "MTO" ? "#818cf8" : "#94a3b8"
                    }}>{orden.tipo}</span>
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
                    value={orden.estado}
                    onChange={(e) => onStatusChange(orden.id, e.target.value as EstadoOrden, orden)}
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
                <span className="text-xs font-bold capitalize" style={{ color: prio.color }}>{orden.prioridad}</span>
            </td>

            <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
                {formatLocalDate(orden.fechaEntregaEstimada)}
            </td>

            <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(orden)}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                        title="Editar Orden Completa"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(orden.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                        title="Eliminar Orden"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
