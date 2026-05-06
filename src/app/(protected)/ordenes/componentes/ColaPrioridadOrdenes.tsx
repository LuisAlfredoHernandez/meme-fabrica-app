"use client";

import { useState, useEffect } from "react";
import { GripVertical, AlertCircle, Clock, CheckCircle2, Pause, ArrowUpDown } from "lucide-react";
import { Orden, EstadoOrden } from "@/types";
import { AppColors } from "@/shared/constants";

// Configuraciones visuales (puedes moverlas a constantes globales luego)
const ESTADO_CFG: Record<EstadoOrden, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pendiente: { label: "Pendiente", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    en_proceso: { label: "En proceso", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    pausada: { label: "Pausada", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <Pause className="w-3.5 h-3.5" /> },
    completada: { label: "Completada", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

interface ColaPrioridadesProps {
    ordenes: Orden[];
    onReorder: (ordenesActualizadas: Orden[]) => Promise<void>;
}

export function ColaPrioridadesOrdenes({ ordenes, onReorder }: ColaPrioridadesProps) {
    const [colaVisual, setColaVisual] = useState<Orden[]>([]);
    const [dragIdx, setDragIdx] = useState<number | null>(null);

    // Sincronización con la "Fuente de Verdad" (Store) cuando no hay arrastre activo
    if (dragIdx === null && colaVisual !== ordenes) {
        setColaVisual(ordenes);
    }

    const handleDragStart = (idx: number) => setDragIdx(idx);

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;

        const nueva = [...colaVisual];
        const [moved] = nueva.splice(dragIdx, 1);
        nueva.splice(idx, 0, moved);

        // Reasignamos la propiedad 'cola' localmente para que el badge visual cambie
        const reordenada = nueva.map((o, i) => ({ ...o, cola: i + 1 }));

        setColaVisual(reordenada);
        setDragIdx(idx);
    };

    const handleDragEnd = async () => {
        if (dragIdx === null) return;

        // Disparamos la actualización al Store/DB
        await onReorder(colaVisual);
        setDragIdx(null);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(249,115,22,0.08)", border: `1px solid rgba(249,115,22,0.25)`, color: AppColors.orange }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                Arrastra las órdenes para reordenar la producción. El orden define la secuencia en planta.
            </div>

            {colaVisual.map((o, idx) => {
                const est = ESTADO_CFG[o.estado];
                const totalCant = o.lineas.reduce((acc, l) => acc + l.cantidad, 0);
                const totalComp = o.lineas.reduce((acc, l) => acc + (l.cantidadCompletada ?? 0), 0);
                const pct = totalCant > 0 ? Math.round((totalComp / totalCant) * 100) : 0;

                return (
                    <div
                        key={o.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={e => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className="flex items-center gap-4 px-4 py-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:bg-white/[0.02]"
                        style={{
                            background: dragIdx === idx ? `${AppColors.orange}10` : AppColors.surface,
                            borderColor: dragIdx === idx ? AppColors.orange : AppColors.border,
                        }}
                    >
                        <GripVertical className="w-5 h-5 shrink-0" style={{ color: AppColors.slate }} />

                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: `${AppColors.orange}20`, color: AppColors.orange }}>
                            {o.cola}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold" style={{ color: AppColors.orange }}>{o.numero}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{o.tipo}</span>
                            </div>
                            <p className="text-sm text-white font-medium mt-0.5 truncate">
                                {o.cliente} <span className="text-slate-500 mx-1">•</span> {o.lineas[0]?.descripcion}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className="w-24 h-1 rounded-full bg-[#1e293b]">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: AppColors.orange }} />
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">{pct}%</span>
                            </div>
                        </div>

                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0"
                            style={{ background: est.bg, color: est.color }}>
                            {est.icon}{est.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}