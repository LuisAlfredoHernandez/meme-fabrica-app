"use client";

import { useState } from "react";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { Wrench, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { ReporteAveria } from "@/types";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { StatusBadge } from "@/features/maquinas/componentes/StatusBadge.";

export function GestionAverias() {
    const { reportesAveriaPendientes } = useMaquinasStore();
    const { fetchReportesAveriaPendientes, procesarReporteAveria, fetchMaquinas } = useMaquinasActions();
    const { addToastOnly } = useNotificationActions();

    const [selectedAveria, setSelectedAveria] = useState<ReporteAveria | null>(null);
    const [notasAveria, setNotasAveria] = useState("");
    const [isProcessingAveria, setIsProcessingAveria] = useState(false);

    const handleProcesarAveria = async (aprobado: boolean) => {
        if (!selectedAveria) return;

        setIsProcessingAveria(true);
        try {
            const success = await procesarReporteAveria(selectedAveria.id, aprobado, notasAveria);
            setIsProcessingAveria(false);

            if (success) {
                const mensaje = aprobado
                    ? `Avería Aceptada: La máquina ${selectedAveria.maquina_codigo || ''} ha pasado a FUERA DE SERVICIO.`
                    : `Avería Rechazada: La máquina ${selectedAveria.maquina_codigo || ''} ha vuelto a estar OPERATIVA.`;

                addToastOnly(
                    aprobado ? "Avería Aceptada" : "Avería Rechazada",
                    mensaje,
                    aprobado ? "warning" : "info"
                );
                setSelectedAveria(null);
                setNotasAveria("");
                fetchMaquinas();
                fetchReportesAveriaPendientes();
            } else {
                addToastOnly("Error", "No se pudo procesar el reporte de avería.", "error");
            }
        } catch (e: any) {
            setIsProcessingAveria(false);
            addToastOnly("Error", e.message || "Error al procesar el reporte de avería.", "error");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Lista de reportes de averías pendientes */}
            <div className="lg:col-span-7 bg-[#13161e] border border-[#1e2130] rounded-3xl p-6 shadow-lg shadow-black/50">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400" /> Máquinas Reportadas con Problemas
                </h2>

                {reportesAveriaPendientes.length === 0 ? (
                    <div className="text-center py-12 bg-[#080b10] rounded-2xl border border-[#1e2130]">
                        <CheckCircle className="w-12 h-12 text-[#34d399] mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No hay reportes de avería pendientes de evaluación.</p>
                        <p className="text-xs text-slate-600 mt-1">Todas las máquinas están operativas o evaluadas.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reportesAveriaPendientes.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => setSelectedAveria(report)}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedAveria?.id === report.id
                                    ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                                    : "bg-[#080b10] border-[#1e2130] hover:border-amber-500/30 hover:bg-[#1a1d27]"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            <Wrench className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-orange-400 text-sm">{report.maquina_codigo || "MAQ-N/A"}</span>
                                                <span className="text-white font-bold text-sm">{report.maquina_nombre}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">Reportado por: <strong className="text-slate-200">{report.operario_nombre || 'Operario'}</strong></p>
                                        </div>
                                    </div>
                                    <StatusBadge status="bajo_revision" />
                                </div>

                                <div className="p-3 bg-[#13161e] rounded-xl border border-white/5 space-y-1.5">
                                    <p className="text-xs text-slate-300 line-clamp-2"><span className="text-slate-500 font-semibold">Falla:</span> {report.descripcion}</p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                                        <span>Tipo: {report.tipo_falla}</span>
                                        <span className={report.gravedad === 'critica' ? 'text-red-400 font-black' : 'text-amber-400'}>
                                            Gravedad: {report.gravedad}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Panel de Evaluación y Decisión de Avería */}
            <div className="lg:col-span-5">
                {selectedAveria ? (
                    <div className="bg-[#13161e] border border-amber-500/30 p-6 rounded-3xl shadow-lg shadow-amber-500/10 sticky top-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Evaluación de Avería</h2>
                                <p className="text-xs text-slate-400 font-mono">{selectedAveria.maquina_codigo} - {selectedAveria.maquina_nombre}</p>
                            </div>
                        </div>

                        <div className="bg-[#080b10] border border-[#1e2130] rounded-2xl p-5 mb-6 space-y-3">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Descripción del Problema</p>
                                <p className="text-sm text-slate-200 mt-1 font-medium bg-[#13161e] p-3 rounded-xl border border-white/5">{selectedAveria.descripcion}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Operario</p>
                                    <p className="text-slate-300 font-semibold">{selectedAveria.operario_nombre || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Gravedad</p>
                                    <span className={`font-bold ${selectedAveria.gravedad === 'critica' ? 'text-red-400' : 'text-amber-400'}`}>
                                        {selectedAveria.gravedad.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observaciones / Notas del Supervisor</label>
                                <textarea
                                    value={notasAveria}
                                    onChange={(e) => setNotasAveria(e.target.value)}
                                    placeholder="Detalla acciones a tomar o motivo del rechazo..."
                                    className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500 transition-all resize-none h-20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={isProcessingAveria}
                                    onClick={() => handleProcesarAveria(false)}
                                    className="py-3.5 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4 text-slate-400" />
                                    Rechazar (Volver a Operativa)
                                </button>

                                <button
                                    type="button"
                                    disabled={isProcessingAveria}
                                    onClick={() => handleProcesarAveria(true)}
                                    className="py-3.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 border border-red-400/30 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                    Aceptar (Fuera de Servicio)
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[300px] border-2 border-dashed border-[#1e2130] rounded-3xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                        <Wrench className="w-12 h-12 mb-4 opacity-50 text-amber-500" />
                        <p className="font-medium">Selecciona un reporte de avería para evaluarlo, confirmarlo o descartarlo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
