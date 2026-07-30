"use client";

import { useState } from "react";
import { useValidacionStore, useValidacionActions } from "@/features/validacion/store/useValidacionStore";
import { ClipboardCheck, CheckCircle2, Clock, Zap, Factory, AlertTriangle, ShieldCheck } from "lucide-react";
import { ValidacionReporte } from "@/features/validacion/schemas/validacion.schema";
import { useNotificationActions } from "@/shared/store/useNotificationStore";

export function CertificacionProduccion() {
    const { pendientes, isLoading } = useValidacionStore();
    const { validarReporte } = useValidacionActions();
    const { addToastOnly } = useNotificationActions();

    const [selectedReport, setSelectedReport] = useState<ValidacionReporte | null>(null);
    const [buenas, setBuenas] = useState<number | "">("");
    const [defectuosas, setDefectuosas] = useState<number | "">("");
    const [fechaInicio, setFechaInicio] = useState<string>("");
    const [fechaFin, setFechaFin] = useState<string>("");
    const [isValidating, setIsValidating] = useState(false);

    const formatForDatetimeLocal = (isoString?: string | null) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "";
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const handleSelectReport = (report: ValidacionReporte) => {
        setSelectedReport(report);
        setBuenas("");
        setDefectuosas("");
        setFechaInicio(report.fechaInicio ? formatForDatetimeLocal(report.fechaInicio) : "");
        setFechaFin(report.fechaFin ? formatForDatetimeLocal(report.fechaFin) : "");
    };

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport || buenas === "" || defectuosas === "") return;

        setIsValidating(true);
        const isoInicio = fechaInicio ? new Date(fechaInicio).toISOString() : null;
        const isoFin = fechaFin ? new Date(fechaFin).toISOString() : null;
        const success = await validarReporte(selectedReport.id, Number(buenas), Number(defectuosas), isoInicio, isoFin);
        setIsValidating(false);

        if (success) {
            setSelectedReport(null);
            setBuenas("");
            setDefectuosas("");
            addToastOnly(
                "Reporte Validado",
                "Reporte de producción validado exitosamente.",
                "success"
            );
        } else {
            addToastOnly(
                "Error de Validación",
                "Error al validar el reporte.",
                "error"
            );
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Lista de pendientes */}
            <div className="lg:col-span-7 bg-[#13161e] border border-[#1e2130] rounded-3xl p-6 shadow-lg shadow-black/50">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" /> Reportes de tareas en espera
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-10 text-slate-500">
                        <Zap className="animate-spin w-8 h-8 text-[#818cf8]" />
                    </div>
                ) : pendientes.length === 0 ? (
                    <div className="text-center py-12 bg-[#080b10] rounded-2xl border border-[#1e2130]">
                        <CheckCircle2 className="w-12 h-12 text-[#34d399] mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No hay reportes pendientes de validación.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendientes.map(report => (
                            <div
                                key={report.id}
                                onClick={() => handleSelectReport(report)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedReport?.id === report.id
                                    ? "bg-[#818cf8]/10 border-[#818cf8]/50 shadow-[0_0_15px_rgba(129,140,248,0.2)]"
                                    : "bg-[#080b10] border-[#1e2130] hover:border-slate-600 hover:bg-[#1a1d27]"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                            {report.operarioNombre.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{report.operarioNombre}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{new Date(report.fechaReporte).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Orden</p>
                                        <span className="text-xs font-mono font-bold text-[#818cf8] bg-[#818cf8]/10 px-2 py-1 rounded-md">{report.ordenId}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 bg-[#13161e] p-3 rounded-xl">
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                            <Factory className="w-3 h-3" /> Máquina
                                        </p>
                                        <p className="text-sm font-semibold text-slate-300 capitalize">{report.maquinaId}</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-800"></div>
                                    <div className="flex-1 text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total</p>
                                        <p className="text-xl font-black text-orange-400">{report.piezasReportadas} <span className="text-xs font-normal text-slate-500">pzs</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Formulario de Certificación */}
            <div className="lg:col-span-5">
                {selectedReport ? (
                    <div className="bg-[#13161e] border border-[#818cf8]/30 p-6 rounded-3xl shadow-lg shadow-[#818cf8]/10 sticky top-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#818cf8]/20 flex items-center justify-center text-[#818cf8] shadow-inner">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Certificar Unidades</h2>
                        </div>

                        <div className="bg-[#080b10] border border-[#1e2130] rounded-2xl p-5 mb-6">
                            <p className="text-xs text-slate-400 font-medium mb-1">Operario: <span className="text-white font-bold">{selectedReport.operarioNombre}</span></p>
                            <p className="text-xs text-slate-400 font-medium mb-1">Total Reportado: <span className="text-orange-400 font-black text-base">{selectedReport.piezasReportadas}</span></p>
                            {selectedReport.notas && (
                                <p className="text-xs text-slate-400 font-medium mb-1">Detalle del Operario: <span className="text-emerald-400 font-semibold">{selectedReport.notas.replace('Reportadas por operario: ', '')}</span></p>
                            )}
                            <div className="flex gap-4 mt-3 pt-3 border-t border-[#1e2130]">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Inicio Reportado</p>
                                    <p className="text-xs text-slate-300 font-mono">
                                        {selectedReport.fechaInicio ? new Date(selectedReport.fechaInicio).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }) : 'No Registrado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Fin Reportado</p>
                                    <p className="text-xs text-slate-300 font-mono">
                                        {selectedReport.fechaFin ? new Date(selectedReport.fechaFin).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }) : 'No Registrado'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleValidate} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Unidades Buenas (Validadas)</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={buenas}
                                    onChange={(e) => setBuenas(Number(e.target.value))}
                                    className="w-full bg-[#080b10] border border-emerald-500/30 rounded-xl px-4 py-4 text-emerald-400 text-xl font-black focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Unidades Defectuosas</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={defectuosas}
                                    onChange={(e) => setDefectuosas(Number(e.target.value))}
                                    className="w-full bg-[#080b10] border border-red-500/30 rounded-xl px-4 py-4 text-red-400 text-xl font-black focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner"
                                />
                            </div>

                            <div className="pt-4 border-t border-[#1e2130] space-y-4">
                                <p className="text-xs text-slate-400 font-medium mb-2">Ajuste de tiempos (Opcional si deseas sobreescribirlos)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hora de Inicio</label>
                                        <input
                                            type="datetime-local"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3 py-2.5 text-slate-300 text-xs font-mono focus:outline-none focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8]/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hora de Fin</label>
                                        <input
                                            type="datetime-local"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3 py-2.5 text-slate-300 text-xs font-mono focus:outline-none focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8]/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {buenas !== "" && defectuosas !== "" && selectedReport && (Number(buenas) + Number(defectuosas)) > selectedReport.piezasReportadas && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-400 font-medium">La suma de buenas y defectuosas ({Number(buenas) + Number(defectuosas)}) no puede superar el total reportado ({selectedReport.piezasReportadas}).</p>
                                </div>
                            )}
                            
                            {buenas !== "" && defectuosas !== "" && selectedReport && (Number(buenas) + Number(defectuosas)) < selectedReport.piezasReportadas && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-400 font-medium">La suma de buenas y defectuosas ({Number(buenas) + Number(defectuosas)}) no puede ser menor al total reportado ({selectedReport.piezasReportadas}).</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isValidating || buenas === "" || defectuosas === "" || (selectedReport ? (Number(buenas) + Number(defectuosas)) !== selectedReport.piezasReportadas : false)}
                                className="w-full mt-4 py-4 rounded-xl font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#818cf8] to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-[#818cf8]/25 border border-[#818cf8]/20 flex items-center justify-center gap-2"
                            >
                                {isValidating ? "Procesando..." : <><CheckCircle2 className="w-5 h-5" /> Confirmar y Validar</>}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="h-full min-h-[300px] border-2 border-dashed border-[#1e2130] rounded-3xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                        <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-medium">Selecciona un reporte de la lista para evaluarlo y certificar las unidades.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
