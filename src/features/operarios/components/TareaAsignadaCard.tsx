"use client";

import { useEffect, useState } from "react";
import { AsignacionOrden, Orden } from "@/types";
import { AlertTriangle, Play, Pause, Clock, Lock } from "lucide-react";
import { useWorkSessionStore, useWorkSessionActions } from "../store/useWorkSessionStore";

interface TareaAsignadaCardProps {
    asig: AsignacionOrden;
    ordenCompleta?: Orden;
    prioridadStyle: Record<string, { color: string; bg: string }>;
    estadoStyle: Record<string, { label: string; bg: string; text: string }>;
    maxPiezasPermitidas?: number;
    tareaAnterior?: string | null;
}

export function TareaAsignadaCard({
    asig,
    ordenCompleta,
    prioridadStyle,
    estadoStyle,
    maxPiezasPermitidas,
    tareaAnterior,
}: TareaAsignadaCardProps) {
    const pct = asig.piezas_requeridas > 0 ? Math.round((asig.piezas_completadas / asig.piezas_requeridas) * 100) : 0;
    const isDone = asig.estado === "completada";

    const orderPriority = ordenCompleta?.prioridad || "normal";
    const orderStatus = ordenCompleta?.estado || "pendiente";
    const isOrderPaused = orderStatus === "pausada";
    const isOrderCancelled = orderStatus === "cancelada";
    
    // Work session integration
    const session = useWorkSessionStore(state => state.sessions[asig.id]);
    const { startTask, pauseTask } = useWorkSessionActions();
    const isActive = session?.status === "in_progress";
    
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!session) {
            setElapsedSeconds(0);
            return;
        }

        let intervalId: NodeJS.Timeout;

        const calculateElapsed = () => {
            let total = session.accumulatedSeconds;
            if (session.status === "in_progress") {
                const lastStart = session.intervals[session.intervals.length - 1]?.start;
                if (lastStart) {
                    total += Math.floor((Date.now() - new Date(lastStart).getTime()) / 1000);
                }
            }
            setElapsedSeconds(total);
        };

        calculateElapsed();

        if (session.status === "in_progress") {
            intervalId = setInterval(calculateElapsed, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [session]);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isOrderCompleted = orderStatus === "completada";
    const isInactive = isOrderPaused || isOrderCancelled || isOrderCompleted;
    
    const isBlocked = maxPiezasPermitidas === 0;

    return (
        <div
            className={`bg-gradient-to-br from-[#13161e] to-[#0d1018] border rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-800 transition-all duration-300 shadow-lg ${isOrderCancelled ? 'border-red-500/20 opacity-70' :
                isOrderPaused ? 'border-amber-500/20 opacity-80 animate-[pulse_3s_infinite]' :
                isBlocked ? 'border-indigo-500/30 opacity-70' :
                isActive ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' :
                'border-[#1e2130]'
                }`}
        >
            <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black font-mono text-orange-400 uppercase tracking-tight bg-orange-500/10 px-2.5 py-0.5 rounded-full w-fit">
                            {asig.orden?.numero || ordenCompleta?.numero || 'ORD-N/A'}
                        </span>
                        {ordenCompleta && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md"
                                    style={{
                                        backgroundColor: prioridadStyle[orderPriority]?.bg || "rgba(148,163,184,0.12)",
                                        color: prioridadStyle[orderPriority]?.color || "#94a3b8"
                                    }}>
                                    {orderPriority.toUpperCase()}
                                </span>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${estadoStyle[orderStatus]?.bg || "bg-slate-500/10"
                                    } ${estadoStyle[orderStatus]?.text || "text-slate-400"}`}>
                                    {orderStatus.replace("_", " ").toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Timer and Play/Pause Actions */}
                    {!isDone && !isInactive && (
                        <div className="flex flex-col items-end gap-1.5 relative">
                            {session && (
                                <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(elapsedSeconds)}
                                </div>
                            )}
                            {isActive ? (
                                <button 
                                    onClick={() => pauseTask(asig.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase transition-colors"
                                >
                                    <Pause className="w-3 h-3" /> Pausar
                                </button>
                            ) : (
                                <div className="relative">
                                    {/* Tutorial Ping Effect when task is entirely new (no session) */}
                                    {!session && !isBlocked && (
                                        <span className="absolute -inset-1.5 rounded-xl border border-emerald-500/40 animate-[ping_2s_ease-in-out_infinite] z-0"></span>
                                    )}
                                    <button 
                                        onClick={() => startTask(asig.id)}
                                        disabled={isBlocked}
                                        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase transition-colors text-[10px] ${
                                            isBlocked
                                                ? 'bg-indigo-500/10 text-indigo-400 opacity-50 cursor-not-allowed border border-indigo-500/20'
                                                : (!session 
                                                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-105 transform duration-300' 
                                                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20')
                                        }`}
                                    >
                                        <Play className="w-3 h-3" /> {session ? 'Continuar' : 'Empezar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white leading-tight mt-1">{asig.tarea}</h3>
                        {isBlocked && (
                            <div className="flex items-center gap-1 bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md mt-1 border border-indigo-500/30">
                                <Lock className="w-3 h-3" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Bloqueada ({tareaAnterior})</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Cliente: {asig.orden?.cliente || ordenCompleta?.cliente || 'N/A'}</p>
                    {maxPiezasPermitidas !== undefined && (
                        <p className={`text-[10px] font-bold mt-1.5 ${isBlocked ? 'text-indigo-400' : 'text-emerald-400'}`}>
                            Piezas Disponibles: {maxPiezasPermitidas}
                        </p>
                    )}
                </div>
            </div>

            {/* Banners visuales de advertencia por estado de la orden */}
            {isOrderPaused && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold animate-pulse">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Orden PAUSADA por el supervisor. Trabajo detenido.</span>
                </div>
            )}
            {isOrderCancelled && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>Orden CANCELADA. Producción abortada.</span>
                </div>
            )}
            {isOrderCompleted && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center text-emerald-500 font-bold">✓</span>
                    <span>Orden COMPLETADA. Tarea archivada.</span>
                </div>
            )}

            <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                    <span>Progreso</span>
                    <span className="font-bold text-slate-200 font-mono">{asig.piezas_completadas} / {asig.piezas_requeridas} uds. ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
            </div>
            {asig.notas && (
                <p className="text-[10px] bg-white/5 p-2 rounded-xl text-slate-400 border border-white/5 leading-relaxed">
                    <span className="font-bold block text-slate-300">Notas:</span> {asig.notas}
                </p>
            )}
        </div>
    );
}
