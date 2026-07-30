"use client";

import { useState, useEffect } from "react";
import { AsignacionOrden, Orden, Operario } from "@/types";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { useWorkSessionStore, useWorkSessionActions } from "../store/useWorkSessionStore";

interface FormularioReporteAvanceProps {
    miOperario: Operario;
    misAsignaciones: AsignacionOrden[];
    ordenes: Orden[];
    maquinaEstado?: string;
    maquinaActual?: string;
    reportarAvance: (data: { asignacion_id: string; piezas_reportadas: number; piezas_buenas?: number; piezas_defectuosas?: number; maquina_id?: string; notas?: string; fecha_inicio?: string; fecha_fin?: string }) => Promise<boolean>;
}

export function FormularioReporteAvance({
    miOperario,
    misAsignaciones,
    ordenes,
    maquinaEstado,
    maquinaActual,
    reportarAvance,
}: FormularioReporteAvanceProps) {
    const [selectedAsigId, setSelectedAsigId] = useState("");
    const [piezasProducidas, setPiezasProducidas] = useState<number | "">("");
    const [piezasDefectuosas, setPiezasDefectuosas] = useState<number | "">("");
    const { addToastOnly } = useNotificationActions();
    
    const { activeTaskId, sessions } = useWorkSessionStore();
    const { clearSession } = useWorkSessionActions();

    useEffect(() => {
        if (activeTaskId && misAsignaciones.some(a => a.id === activeTaskId)) {
            setSelectedAsigId(activeTaskId);
        }
    }, [activeTaskId, misAsignaciones]);

    const selectedAsig = misAsignaciones.find(a => a.id === selectedAsigId);
    const selectedAsigOrder = selectedAsig ? ordenes.find(o => o.id === selectedAsig.orden_id) : null;
    const selectedAsigIsPaused = selectedAsigOrder?.estado === "pausada";
    const selectedAsigIsCancelled = selectedAsigOrder?.estado === "cancelada";
    const selectedAsigIsInactive = selectedAsigIsPaused || selectedAsigIsCancelled;
    
    const currentSession = selectedAsigId ? sessions[selectedAsigId] : null;

    const handleReportarProduccion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (piezasProducidas === "" || piezasDefectuosas === "") return;
        if (!selectedAsigId || !currentSession) return;

        let calculatedFechaInicio: string | undefined = undefined;
        let calculatedFechaFin: string | undefined = undefined;

        // Ensure we capture current time if still in progress
        const now = new Date().toISOString();
        const intervals = currentSession.intervals;
        
        if (intervals.length > 0) {
            calculatedFechaInicio = intervals[0].start;
            const lastInterval = intervals[intervals.length - 1];
            calculatedFechaFin = lastInterval.end || now;
        }

        const targetAsig = misAsignaciones.find(a => a.id === selectedAsigId);
        if (targetAsig) {
            const totalReportado = Number(piezasProducidas) + Number(piezasDefectuosas);

            const success = await reportarAvance({
                asignacion_id: targetAsig.id,
                piezas_reportadas: totalReportado,
                piezas_buenas: Number(piezasProducidas),
                piezas_defectuosas: Number(piezasDefectuosas),
                maquina_id: maquinaActual || undefined,
                notas: `Reportadas por operario: ${piezasProducidas} buenas, ${piezasDefectuosas} defectuosas.`,
                fecha_inicio: calculatedFechaInicio,
                fecha_fin: calculatedFechaFin
            });

            if (success) {
                addToastOnly(
                    "Avance Reportado",
                    `Tu reporte de avance de ${totalReportado} piezas (${piezasProducidas} buenas, ${piezasDefectuosas} defectuosas) ha sido enviado.`,
                    "success"
                );
                // Reset the timer since pieces were reported successfully
                clearSession(targetAsig.id);
            } else {
                addToastOnly(
                    "Error de Reporte",
                    "Error al enviar la solicitud de avance.",
                    "error"
                );
            }
        }

        setPiezasProducidas("");
        setPiezasDefectuosas("");
        setSelectedAsigId("");
    };

    return (
        <div className="bg-[#13161e] border border-[#1e2130] p-5 rounded-3xl hover:border-slate-800 transition-colors shadow-lg shadow-black/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Reportar Avance</h2>
                </div>
            </div>

            <form onSubmit={handleReportarProduccion} className="space-y-3.5">
                {/* Selector de Tarea Asignada */}
                <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 group-hover:text-orange-400 transition-colors">Seleccionar Tarea Asignada</label>
                    <select
                        required
                        value={selectedAsigId}
                        onChange={(e) => setSelectedAsigId(e.target.value)}
                        className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-all hover:border-slate-700"
                    >
                        <option value="">Seleccionar una tarea activa...</option>
                        {misAsignaciones.map(a => {
                            const ord = ordenes.find(o => o.id === a.orden_id);
                            const isPaused = ord?.estado === "pausada";
                            const isCancelled = ord?.estado === "cancelada";
                            const suffix = isPaused ? " (PAUSADA)" : isCancelled ? " (CANCELADA)" : "";
                            return (
                                <option key={a.id} value={a.id} className={isPaused || isCancelled ? "text-slate-500" : "text-white"}>
                                    {a.orden?.numero || ord?.numero || 'ORD-N/A'} — {a.tarea} (Faltan: {a.piezas_requeridas - a.piezas_completadas} uds.){suffix}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 group-hover:text-orange-400 transition-colors">Unidades Producidas (Buenas)</label>
                    <input
                        type="number"
                        min="1"
                        required
                        disabled={selectedAsigIsInactive}
                        value={piezasProducidas}
                        onChange={(e) => setPiezasProducidas(Number(e.target.value))}
                        className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Ej. 10"
                    />
                </div>
                <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 group-hover:text-orange-400 transition-colors">Unidades Defectuosas</label>
                    <input
                        type="number"
                        min="0"
                        required
                        disabled={selectedAsigIsInactive}
                        value={piezasDefectuosas}
                        onChange={(e) => setPiezasDefectuosas(Number(e.target.value))}
                        className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Ej. 0"
                    />
                </div>

                {selectedAsigId && !currentSession && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-500">Debes iniciar la tarea</p>
                            <p className="text-xs text-amber-400/80">No has iniciado sesión de trabajo para esta orden. Haz clic en "Empezar" en la tarjeta de la tarea arriba antes de reportar el avance.</p>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={maquinaEstado !== "operativa" || !selectedAsigId || selectedAsigIsInactive || !currentSession}
                    className="w-full mt-2.5 py-3 rounded-xl font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:hover:shadow-none border border-orange-400/20"
                >
                    {maquinaEstado !== "operativa"
                        ? "Máquina Inactiva - No se puede reportar"
                        : selectedAsigIsPaused
                        ? "Orden Pausada - No se puede reportar"
                        : selectedAsigIsCancelled
                        ? "Orden Cancelada - No se puede reportar"
                        : !selectedAsigId
                        ? "Seleccione una tarea"
                        : !currentSession
                        ? "Tarea no iniciada"
                        : "Guardar Producción"}
                </button>
            </form>
        </div>
    );
}
