"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useAsignacionStore, useAsignacionActions } from "@/features/operarios/store/useAsignacionStore";
import { useOrdenStore, useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { StatCard } from "@/components/StatCard";
import { TareaAsignadaCard } from "@/features/operarios/components/TareaAsignadaCard";
import { History, CheckCircle2, AlertCircle, Zap, ZapOff, CheckCircle } from "lucide-react";

export default function MiHistorialPage() {
    const { user } = useAuthStore();

    const { operarios, isLoading: loadingOperarios } = useOperarioStore();
    const { fetchOperarios } = useOperarioActions();

    const { asignaciones } = useAsignacionStore();
    const { fetchAsignaciones } = useAsignacionActions();

    const { ordenes } = useOrdenStore();
    const { fetchOrdenes } = useOrdenActions();

    const miOperario = user && operarios.length > 0
        ? operarios.find(o => o.correo === user.correo || o.nombre === user.nombre) || null
        : null;

    useEffect(() => {
        fetchOperarios();
        fetchAsignaciones();
        fetchOrdenes();
    }, [fetchOperarios, fetchAsignaciones, fetchOrdenes]);

    const PRIORIDAD_VALORES: Record<string, number> = {
        urgente: 4, alta: 3, normal: 2, baja: 1
    };

    const misAsignacionesTodas = miOperario
        ? [...asignaciones]
            .filter(a => a.operario_id === miOperario.id)
            .sort((a, b) => {
                const ordenA = ordenes.find(o => o.id === a.orden_id);
                const ordenB = ordenes.find(o => o.id === b.orden_id);

                const prioA = PRIORIDAD_VALORES[ordenA?.prioridad || "normal"] || 0;
                const prioB = PRIORIDAD_VALORES[ordenB?.prioridad || "normal"] || 0;

                if (prioA !== prioB) return prioB - prioA;

                const dateA = ordenA?.fechaEntregaEstimada ? new Date(ordenA.fechaEntregaEstimada).getTime() : Infinity;
                const dateB = ordenB?.fechaEntregaEstimada ? new Date(ordenB.fechaEntregaEstimada).getTime() : Infinity;
                return dateA - dateB;
            })
        : [];

    const misAsignacionesCompletadas = misAsignacionesTodas.filter(a => {
        const ord = ordenes.find(o => o.id === a.orden_id);
        const isOrderCompleted = ord?.estado === "completada";
        const isTaskCompleted = a.piezas_completadas >= a.piezas_requeridas;
        return isOrderCompleted || isTaskCompleted;
    });

    const ORDEN_ESTADO_STYLE: Record<string, { label: string; bg: string; text: string }> = {
        pendiente: { label: "Pendiente", bg: "bg-slate-500/10", text: "text-slate-400" },
        en_proceso: { label: "En proceso", bg: "bg-orange-500/10", text: "text-orange-400" },
        pausada: { label: "Pausada", bg: "bg-amber-500/10", text: "text-amber-400" },
        completada: { label: "Completada", bg: "bg-emerald-500/10", text: "text-emerald-400" },
        cancelada: { label: "Cancelada", bg: "bg-red-500/10", text: "text-red-400" },
    };

    const ORDEN_PRIO_STYLE: Record<string, { color: string; bg: string }> = {
        baja: { color: "#64748b", bg: "rgba(100,116,139,0.12)" },
        normal: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
        alta: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
        urgente: { color: "#f87171", bg: "rgba(248,113,113,0.15)" },
    };

    if (loadingOperarios) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen text-slate-400">
                <Zap className="animate-spin w-8 h-8 text-orange-500 mr-4" /> Cargando historial...
            </div>
        );
    }

    if (!miOperario) {
        return (
            <div className="p-8 text-white">
                <h1 className="text-2xl font-bold mb-2">Mi Historial</h1>
                <p className="text-slate-400">No se encontró información de operario asignada a tu cuenta.</p>
            </div>
        );
    }

    // Calcular estadísticas
    const totalBuenas = miOperario.piezas_buenas ?? 0;
    const totalDefectuosas = miOperario.piezas_defectuosas ?? 0;
    const totalPiezas = totalBuenas + totalDefectuosas;
    const porcentajeDefectos = totalPiezas > 0 ? ((totalDefectuosas / totalPiezas) * 100).toFixed(1) : "0.0";
    
    // Contar tipos de máquinas manejadas en el historial (simplificado por habilidades por ahora)
    const maquinasManejadas = miOperario.habilidades.length;

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-6">
            <div className="mb-6 flex items-center gap-3">
                <History className="w-8 h-8 text-emerald-500" />
                <div>
                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Mi Historial de Producción</h1>
                    <p className="text-slate-400 font-medium text-sm">Resumen de tu rendimiento y tareas completadas.</p>
                </div>
            </div>

            {/* Panel de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Tareas Completadas"
                    valor={misAsignacionesCompletadas.length}
                    icon={CheckCircle}
                    color="#10b981"
                    labelColor="#10b981"
                />
                <StatCard
                    label="Total Unidades Buenas"
                    valor={totalBuenas}
                    icon={CheckCircle2}
                    color="#34d399"
                    labelColor="#34d399"
                />
                <StatCard
                    label="Total Defectuosas"
                    valor={totalDefectuosas}
                    icon={AlertCircle}
                    color="#f43f5e"
                    labelColor="#f43f5e"
                />
                <StatCard
                    label="Tasa de Defectos"
                    valor={`${porcentajeDefectos}%`}
                    icon={totalDefectuosas > 0 ? ZapOff : Zap}
                    color={Number(porcentajeDefectos) > 5 ? "#f43f5e" : "#818cf8"}
                    labelColor={Number(porcentajeDefectos) > 5 ? "#f43f5e" : "#818cf8"}
                />
            </div>

            {/* Listado de Historial */}
            <div className="bg-[#13161e] border border-[#1e2130] rounded-3xl p-6 shadow-lg shadow-black/50">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Órdenes y Tareas Finalizadas
                </h2>

                {misAsignacionesCompletadas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {misAsignacionesCompletadas.map(asig => (
                            <TareaAsignadaCard
                                key={asig.id}
                                asig={asig}
                                ordenCompleta={ordenes.find(o => o.id === asig.orden_id)}
                                prioridadStyle={ORDEN_PRIO_STYLE}
                                estadoStyle={ORDEN_ESTADO_STYLE}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-[#080b10] rounded-2xl border border-[#1e2130]">
                        <CheckCircle2 className="w-12 h-12 text-[#34d399] mx-auto mb-3 opacity-50" />
                        <p className="text-slate-400 font-medium">Aún no tienes tareas completadas en tu historial.</p>
                        <p className="text-xs text-slate-600 mt-1">Sigue reportando avances en tu estación de trabajo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
