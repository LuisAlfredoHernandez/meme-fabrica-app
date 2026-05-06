"use client";

import {
    Clock, ArrowUpDown, Pause, CheckCircle2, Package
} from "lucide-react";
import { Orden, EstadoOrden, Prioridad } from "@/types";
import { AppColors } from "@/shared/constants";

// Configuraciones visuales internas del componente
const ESTADO_CFG: Record<EstadoOrden, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pendiente: { label: "Pendiente", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    en_proceso: { label: "En proceso", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    pausada: { label: "Pausada", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <Pause className="w-3.5 h-3.5" /> },
    completada: { label: "Completada", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const PRIORIDAD_CFG: Record<Prioridad, { color: string }> = {
    baja: { color: "#64748b" },
    normal: { color: "#94a3b8" },
    alta: { color: "#fbbf24" },
    urgente: { color: "#f87171" },
};

interface TablaOrdenesProps {
    ordenes: Orden[];
}

export function TablaOrdenes({ ordenes }: TablaOrdenesProps) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${AppColors.border}` }}>
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ background: AppColors.surface }}>
                        {["Orden / Cliente", "Tipo", "Prenda", "Avance", "Estado", "Prioridad", "Entrega"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: AppColors.slate }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {ordenes.map((o, i) => {
                        // Cálculos de lógica de negocio
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
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: est.bg, color: est.color }}>
                                        {est.icon}{est.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-bold capitalize" style={{ color: prio.color }}>{o.prioridad}</span>
                                </td>
                                <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
                                    {new Date(o.fechaEntregaEstimada).toLocaleDateString()}
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
    );
}