"use client";

import { useState } from "react";
import { AsignacionOrden, Orden } from "@/types";
import { CheckCircle2 } from "lucide-react";

interface FormularioReporteAvanceProps {
    misAsignaciones: AsignacionOrden[];
    ordenes: Orden[];
    maquinaEstado?: string;
    maquinaActual?: string;
    reportarAvance: (data: { asignacion_id: string; piezas_reportadas: number; maquina_id?: string; notas?: string }) => Promise<boolean>;
}

export function FormularioReporteAvance({
    misAsignaciones,
    ordenes,
    maquinaEstado,
    maquinaActual,
    reportarAvance,
}: FormularioReporteAvanceProps) {
    const [selectedAsigId, setSelectedAsigId] = useState("");
    const [piezasProducidas, setPiezasProducidas] = useState<number | "">("");
    const [piezasDefectuosas, setPiezasDefectuosas] = useState<number | "">("");

    const selectedAsig = misAsignaciones.find(a => a.id === selectedAsigId);
    const selectedAsigOrder = selectedAsig ? ordenes.find(o => o.id === selectedAsig.orden_id) : null;
    const selectedAsigIsPaused = selectedAsigOrder?.estado === "pausada";
    const selectedAsigIsCancelled = selectedAsigOrder?.estado === "cancelada";
    const selectedAsigIsInactive = selectedAsigIsPaused || selectedAsigIsCancelled;

    const handleReportarProduccion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (piezasProducidas === "" || piezasDefectuosas === "") return;

        if (selectedAsigId) {
            const targetAsig = misAsignaciones.find(a => a.id === selectedAsigId);
            if (targetAsig) {
                const totalReportado = Number(piezasProducidas) + Number(piezasDefectuosas);

                const success = await reportarAvance({
                    asignacion_id: targetAsig.id,
                    piezas_reportadas: totalReportado,
                    maquina_id: maquinaActual || undefined,
                    notas: `Reportadas por operario: ${piezasProducidas} buenas, ${piezasDefectuosas} defectuosas.`
                });

                if (success) {
                    alert(`Solicitud de avance enviada para validación del supervisor: ${totalReportado} piezas totales (${piezasProducidas} buenas, ${piezasDefectuosas} defectuosas).`);
                } else {
                    alert("Error al enviar la solicitud de avance.");
                }
            }
        }

        setPiezasProducidas("");
        setPiezasDefectuosas("");
        setSelectedAsigId("");
    };

    return (
        <div className="bg-[#13161e] border border-[#1e2130] p-6 rounded-3xl hover:border-slate-800 transition-colors shadow-lg shadow-black/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Reportar Avance de Tarea</h2>
            </div>

            <form onSubmit={handleReportarProduccion} className="space-y-5">
                {/* Selector de Tarea Asignada */}
                <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-orange-400 transition-colors">Seleccionar Tarea Asignada</label>
                    <select
                        required
                        value={selectedAsigId}
                        onChange={(e) => setSelectedAsigId(e.target.value)}
                        className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all hover:border-slate-700"
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-orange-400 transition-colors">Unidades Producidas (Buenas)</label>
                    <input
                        type="number"
                        min="1"
                        required
                        disabled={selectedAsigIsInactive}
                        value={piezasProducidas}
                        onChange={(e) => setPiezasProducidas(Number(e.target.value))}
                        className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Ej. 10"
                    />
                </div>
                <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-orange-400 transition-colors">Unidades Defectuosas</label>
                    <input
                        type="number"
                        min="0"
                        required
                        disabled={selectedAsigIsInactive}
                        value={piezasDefectuosas}
                        onChange={(e) => setPiezasDefectuosas(Number(e.target.value))}
                        className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Ej. 0"
                    />
                </div>

                <button
                    type="submit"
                    disabled={maquinaEstado !== "operativa" || !selectedAsigId || selectedAsigIsInactive}
                    className="w-full mt-4 py-4 rounded-xl font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:hover:shadow-none border border-orange-400/20"
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
