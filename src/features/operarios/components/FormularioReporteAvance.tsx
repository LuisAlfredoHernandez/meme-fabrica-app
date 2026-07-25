"use client";

import { useState } from "react";
import { AsignacionOrden, Orden, Operario } from "@/types";
import { CheckCircle2, Play, Clock } from "lucide-react";
import { useNotificationActions } from "@/shared/store/useNotificationStore";

interface FormularioReporteAvanceProps {
    miOperario: Operario;
    iniciarSesion: () => Promise<boolean>;
    misAsignaciones: AsignacionOrden[];
    ordenes: Orden[];
    maquinaEstado?: string;
    maquinaActual?: string;
    reportarAvance: (data: { asignacion_id: string; piezas_reportadas: number; maquina_id?: string; notas?: string; fecha_inicio?: string }) => Promise<boolean>;
}

export function FormularioReporteAvance({
    miOperario,
    iniciarSesion,
    misAsignaciones,
    ordenes,
    maquinaEstado,
    maquinaActual,
    reportarAvance,
}: FormularioReporteAvanceProps) {
    const [selectedAsigId, setSelectedAsigId] = useState("");
    const [piezasProducidas, setPiezasProducidas] = useState<number | "">("");
    const [piezasDefectuosas, setPiezasDefectuosas] = useState<number | "">("");
    const [timeSelectionMode, setTimeSelectionMode] = useState<"15m" | "30m" | "1h" | "2h" | "manual" | "">("");
    const [manualTime, setManualTime] = useState<string>("");
    const [iniciandoSesion, setIniciandoSesion] = useState(false);
    const [showManualTimePrompt, setShowManualTimePrompt] = useState(false);
    const { addToastOnly } = useNotificationActions();

    const selectedAsig = misAsignaciones.find(a => a.id === selectedAsigId);
    const selectedAsigOrder = selectedAsig ? ordenes.find(o => o.id === selectedAsig.orden_id) : null;
    const selectedAsigIsPaused = selectedAsigOrder?.estado === "pausada";
    const selectedAsigIsCancelled = selectedAsigOrder?.estado === "cancelada";
    const selectedAsigIsInactive = selectedAsigIsPaused || selectedAsigIsCancelled;

    const handleReportarProduccion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (piezasProducidas === "" || piezasDefectuosas === "") return;

        // Si no hay sesión activa, requerimos el tiempo
        let calculatedFechaInicio: string | undefined = undefined;

        if (!miOperario.sesion_activa_desde) {
            if (!timeSelectionMode) {
                setShowManualTimePrompt(true);
                if (showManualTimePrompt) {
                    addToastOnly("Atención", "Selecciona hace cuánto tiempo empezaste.", "error");
                }
                return;
            }

            if (timeSelectionMode === "manual" && !manualTime) {
                addToastOnly("Atención", "Ingresa la hora exacta en el reloj.", "error");
                return;
            }

            const now = new Date();
            if (timeSelectionMode === "15m") {
                calculatedFechaInicio = new Date(now.getTime() - 15 * 60000).toISOString();
            } else if (timeSelectionMode === "30m") {
                calculatedFechaInicio = new Date(now.getTime() - 30 * 60000).toISOString();
            } else if (timeSelectionMode === "1h") {
                calculatedFechaInicio = new Date(now.getTime() - 60 * 60000).toISOString();
            } else if (timeSelectionMode === "2h") {
                calculatedFechaInicio = new Date(now.getTime() - 120 * 60000).toISOString();
            } else if (timeSelectionMode === "manual") {
                const [hours, minutes] = manualTime.split(":").map(Number);
                now.setHours(hours, minutes, 0, 0);
                calculatedFechaInicio = now.toISOString();
            }
        }

        if (selectedAsigId) {
            const targetAsig = misAsignaciones.find(a => a.id === selectedAsigId);
            if (targetAsig) {
                const totalReportado = Number(piezasProducidas) + Number(piezasDefectuosas);

                const success = await reportarAvance({
                    asignacion_id: targetAsig.id,
                    piezas_reportadas: totalReportado,
                    maquina_id: maquinaActual || undefined,
                    notas: `Reportadas por operario: ${piezasProducidas} buenas, ${piezasDefectuosas} defectuosas.`,
                    fecha_inicio: calculatedFechaInicio
                });

                if (success) {
                    addToastOnly(
                        "Avance Reportado",
                        `Tu reporte de avance de ${totalReportado} piezas (${piezasProducidas} buenas, ${piezasDefectuosas} defectuosas) ha sido enviado.`,
                        "success"
                    );
                } else {
                    addToastOnly(
                        "Error de Reporte",
                        "Error al enviar la solicitud de avance.",
                        "error"
                    );
                }
            }
        }

        setPiezasProducidas("");
        setPiezasDefectuosas("");
        setTimeSelectionMode("");
        setManualTime("");
        setShowManualTimePrompt(false);
        setSelectedAsigId("");
    };

    const handleIniciarTarea = async () => {
        setIniciandoSesion(true);
        try {
            const success = await iniciarSesion();
            if (success) {
                addToastOnly("Tarea Iniciada", "Se ha registrado la hora de inicio de tu tarea.", "success");
            }
        } catch (error) {
            addToastOnly("Error", "No se pudo iniciar la tarea.", "error");
        } finally {
            setIniciandoSesion(false);
        }
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
                {!miOperario.sesion_activa_desde && (
                    <button
                        type="button"
                        onClick={handleIniciarTarea}
                        disabled={iniciandoSesion}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        <Play className="w-4 h-4" />
                        {iniciandoSesion ? "Iniciando..." : "Iniciar Tarea"}
                    </button>
                )}
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

                {showManualTimePrompt && !miOperario.sesion_activa_desde && (
                    <div className="group bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-5 h-5 text-red-400" />
                            <label className="block text-sm font-bold text-red-400 uppercase tracking-wider">¿A qué hora empezaste?</label>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">
                            No has iniciado tu tarea. Selecciona rápidamente hace cuánto tiempo empezaste a coser este lote:
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setTimeSelectionMode("15m")}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${timeSelectionMode === "15m" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                            >Hace 15 min</button>
                            <button
                                type="button"
                                onClick={() => setTimeSelectionMode("30m")}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${timeSelectionMode === "30m" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                            >Hace 30 min</button>
                            <button
                                type="button"
                                onClick={() => setTimeSelectionMode("1h")}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${timeSelectionMode === "1h" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                            >Hace 1 hora</button>
                            <button
                                type="button"
                                onClick={() => setTimeSelectionMode("2h")}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${timeSelectionMode === "2h" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                            >Hace 2 horas</button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setTimeSelectionMode("manual")}
                            className={`w-full py-2.5 mb-3 rounded-lg text-sm font-semibold transition-colors ${timeSelectionMode === "manual" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                        >Otra hora exacta (Reloj)</button>

                        {timeSelectionMode === "manual" && (
                            <input
                                type="time"
                                required
                                disabled={selectedAsigIsInactive}
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                className="w-full bg-[#080b10] border border-red-500/50 rounded-lg px-4 py-3 text-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
                            />
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={maquinaEstado !== "operativa" || !selectedAsigId || selectedAsigIsInactive}
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
                        : "Guardar Producción"}
                </button>
            </form>
        </div>
    );
}
