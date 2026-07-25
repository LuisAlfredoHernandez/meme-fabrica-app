"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useValidacionStore, useValidacionActions } from "@/features/validacion/store/useValidacionStore";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { ClipboardCheck, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Clock, Zap, Factory, Wrench, XCircle, CheckCircle, Flame } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ValidacionReporte } from "@/features/validacion/schemas/validacion.schema";
import { ReporteAveria } from "@/types";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { StatusBadge } from "../maquinas/componentes/StatusBadge.";

type ActiveTab = "produccion" | "averias";

export default function ValidacionPage() {
    const { user } = useAuthStore();
    const { pendientes, isLoading } = useValidacionStore();
    const { fetchPendientes, validarReporte } = useValidacionActions();

    const { reportesAveriaPendientes } = useMaquinasStore();
    const { fetchReportesAveriaPendientes, procesarReporteAveria, fetchMaquinas } = useMaquinasActions();

    const { addToastOnly } = useNotificationActions();

    const [activeTab, setActiveTab] = useState<ActiveTab>("produccion");

    // Selección de producción
    const [selectedReport, setSelectedReport] = useState<ValidacionReporte | null>(null);
    const [buenas, setBuenas] = useState<number | "">("");
    const [defectuosas, setDefectuosas] = useState<number | "">("");
    const [fechaInicio, setFechaInicio] = useState<string>("");
    const [fechaFin, setFechaFin] = useState<string>("");
    const [isValidating, setIsValidating] = useState(false);

    // Helper for datetime-local
    const formatForDatetimeLocal = (isoString?: string | null) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "";
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // Selección de avería
    const [selectedAveria, setSelectedAveria] = useState<ReporteAveria | null>(null);
    const [notasAveria, setNotasAveria] = useState("");
    const [isProcessingAveria, setIsProcessingAveria] = useState(false);

    useEffect(() => {
        fetchPendientes();
        fetchReportesAveriaPendientes();
        fetchMaquinas();
    }, [fetchPendientes, fetchReportesAveriaPendientes, fetchMaquinas]);

    const handleSelectReport = (report: ValidacionReporte) => {
        setSelectedReport(report);
        setBuenas(report.piezasReportadas);
        setDefectuosas(0);
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

    // Si no es admin ni subjefe, denegar acceso
    if (user?.rol === "operario") {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Acceso Denegado</h1>
                <p>No tienes permisos para ver esta página.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 overflow-y-auto max-h-screen custom-scrollbar">
            {/* Header y Selector de Pestañas */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[#818cf8]" />
                        <h1 className="text-3xl font-black text-white tracking-tight">Validación & Control de Calidad</h1>
                    </div>
                    <p className="text-slate-400 font-medium mt-2">Certificación de producción y gestión de averías en maquinaria.</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-[#13161e] border border-[#1e2130] p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab("produccion")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "produccion"
                            ? "bg-[#818cf8] text-white shadow-lg shadow-[#818cf8]/20"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <ClipboardCheck className="w-4 h-4" />
                        Producción ({pendientes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("averias")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${activeTab === "averias"
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <Wrench className="w-4 h-4" />
                        Averías Máquinas ({reportesAveriaPendientes?.length ?? 0})
                        {reportesAveriaPendientes?.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute top-1.5 right-1.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Métrica Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Avances de Producción Pendientes"
                    valor={pendientes.length}
                    icon={ClipboardCheck}
                    color="#818cf8"
                    labelColor="#818cf8"
                />
                <StatCard
                    label="Máquinas Bajo Revisión"
                    valor={reportesAveriaPendientes?.length ?? 0}
                    icon={Wrench}
                    color="#fbbf24"
                    labelColor="#fbbf24"
                />
            </div>

            {/* VISTA 1: CERTIFICACIÓN DE PRODUCCIÓN */}
            {activeTab === "produccion" && (
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
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Propuestas</p>
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
                                    <p className="text-xs text-slate-400 font-medium mb-1">Unidades Propuestas: <span className="text-orange-400 font-black text-base">{selectedReport.piezasReportadas}</span></p>
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

                                    {buenas !== "" && defectuosas !== "" && (Number(buenas) + Number(defectuosas)) !== selectedReport.piezasReportadas && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <p className="text-xs text-amber-400 font-medium">La suma de buenas y defectuosas ({Number(buenas) + Number(defectuosas)}) no coincide con lo reportado ({selectedReport.piezasReportadas}). Puedes ajustar esto si hubo un error del operario.</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isValidating}
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
            )}

            {/* VISTA 2: GESTIÓN DE AVERÍAS DE MAQUINARIA */}
            {activeTab === "averias" && (
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
            )}
        </div>
    );
}