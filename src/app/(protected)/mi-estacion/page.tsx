"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { useAsignacionStore, useAsignacionActions } from "@/features/operarios/store/useAsignacionStore";
import { StatCard } from "@/components/StatCard";
import { AppColors } from "@/shared/constants";
import { CheckCircle2, AlertTriangle, Factory, Zap, Wrench, ClipboardList, Calendar } from "lucide-react";

export default function MiEstacionPage() {
    const { user } = useAuthStore();

    const { operarios, isLoading: loadingOperarios } = useOperarioStore();
    const { fetchOperarios } = useOperarioActions();

    const { maquinas, isLoading: loadingMaquinas } = useMaquinasStore();
    const { fetchMaquinas, updateMaquina, reportarAveria } = useMaquinasActions();

    const { asignaciones } = useAsignacionStore();
    const { fetchAsignaciones, updateAsignacion, reportarAvance } = useAsignacionActions();

    // Derivamos el operario y la máquina directamente del estado de los stores
    const miOperario = user && operarios.length > 0
        ? operarios.find(o => o.correo === user.correo || o.nombre === user.nombre) || null
        : null;

    const miMaquina = miOperario?.maquinaActual && maquinas.length > 0
        ? maquinas.find(m => m.tipo === miOperario.maquinaActual) || null
        : null;

    const misAsignaciones = miOperario
        ? asignaciones.filter(a => a.operario_id === miOperario.id)
        : [];

    // Form states
    const [selectedAsigId, setSelectedAsigId] = useState("");
    const [piezasProducidas, setPiezasProducidas] = useState<number | "">("");
    const [piezasDefectuosas, setPiezasDefectuosas] = useState<number | "">("");
    const [motivoFalla, setMotivoFalla] = useState("");
    const [tipoFalla, setTipoFalla] = useState("mecanica");
    const [gravedad, setGravedad] = useState("moderada");
    const [detieneProduccion, setDetieneProduccion] = useState(false);
    const [showFallaForm, setShowFallaForm] = useState(false);

    useEffect(() => {
        fetchOperarios();
        fetchMaquinas();
        fetchAsignaciones();
    }, [fetchOperarios, fetchMaquinas, fetchAsignaciones]);

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
                    maquina_id: miOperario?.maquinaActual || undefined,
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

    const handleReportarFalla = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!miMaquina || !miOperario || !miOperario.id || motivoFalla.trim() === "") return;

        const success = await reportarAveria({
            maquina_id: miMaquina.id,
            operario_id: miOperario.id,
            descripcion: motivoFalla,
            tipo_falla: tipoFalla,
            gravedad: gravedad,
            detiene_produccion: detieneProduccion
        });

        if (success) {
            alert(`Avería reportada exitosamente en ${miMaquina.nombre}. La máquina está ahora en mantenimiento.`);
            setMotivoFalla("");
            setTipoFalla("mecanica");
            setGravedad("moderada");
            setDetieneProduccion(false);
            setShowFallaForm(false);
        } else {
            alert("Error al enviar el reporte de avería.");
        }
    };

    if (loadingOperarios || loadingMaquinas) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen text-slate-400">
                <Zap className="animate-spin w-8 h-8 text-orange-500 mr-4" /> Cargando mi estación...
            </div>
        );
    }

    if (!miOperario) {
        return (
            <div className="p-8 text-white">
                <h1 className="text-2xl font-bold mb-2">Mi Estación</h1>
                <p className="text-slate-400">No se encontró información de operario asignada a tu cuenta.</p>
            </div>
        );
    }

    // Calcular eficiencia
    const habilidadEnMaquina = miOperario.habilidades.find(h => h.maquina === miOperario.maquinaActual);
    const eficiencia = habilidadEnMaquina && habilidadEnMaquina.nivel_eficiencia !== undefined
        ? `${habilidadEnMaquina.nivel_eficiencia}%`
        : "N/A";

    return (
        <div className="p-8 overflow-y-auto max-h-screen custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Mi Estación de Trabajo</h1>
                <p className="text-slate-400 font-medium">Bienvenido <span className="text-white">{miOperario.nombre}</span>.</p>
            </div>

            {/* Listado de Tareas Asignadas */}
            <div className="mb-8 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-orange-500" /> Mis Órdenes y Tareas Asignadas ({misAsignaciones.length})
                </h2>
                
                {misAsignaciones.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {misAsignaciones.map(asig => {
                            const pct = asig.piezas_requeridas > 0 ? Math.round((asig.piezas_completadas / asig.piezas_requeridas) * 100) : 0;
                            const isDone = asig.estado === "completada";
                            return (
                                <div key={asig.id} className="bg-gradient-to-br from-[#13161e] to-[#0d1018] border border-[#1e2130] rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-800 transition-colors shadow-lg">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-[10px] font-black font-mono text-orange-400 uppercase tracking-tight bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                                                {asig.orden?.numero || 'ORD-N/A'}
                                            </span>
                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                asig.estado === "completada" ? 'bg-emerald-500/10 text-emerald-400' :
                                                asig.estado === "en_proceso" ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-slate-500/10 text-slate-400'
                                            }`}>
                                                {asig.estado === "completada" ? 'Completada' :
                                                 asig.estado === "en_proceso" ? 'En Proceso' : 'Pendiente'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white leading-tight">{asig.tarea}</h3>
                                            <p className="text-[11px] text-slate-500 font-medium">Cliente: {asig.orden?.cliente || 'N/A'}</p>
                                        </div>
                                    </div>

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
                                        <p className="text-[10px] bg-white/5 p-2 rounded-xl text-slate-450 border border-white/5 leading-relaxed">
                                            <span className="font-bold block text-slate-300">Notas:</span> {asig.notas}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-6 text-center rounded-3xl bg-[#13161e] border border-white/5 text-slate-500 font-semibold italic text-sm">
                        No tienes tareas asignadas por el supervisor en este momento.
                    </div>
                )}
            </div>

            {/* Kpis / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Máquina Actual"
                    valor={miOperario.maquinaActual ? miOperario.maquinaActual.toUpperCase() : "Ninguna"}
                    icon={Factory}
                    color={AppColors.orange}
                />
                <StatCard
                    label="Eficiencia Estimada"
                    valor={eficiencia}
                    icon={Zap}
                    color="#34d399"
                    labelColor="#34d399"
                />
                <StatCard
                    label="Estado de Máquina"
                    valor={miMaquina?.estado ? miMaquina.estado.toUpperCase() : "Desconocido"}
                    icon={miMaquina?.estado === "operativa" ? CheckCircle2 : AlertTriangle}
                    color={miMaquina?.estado === "operativa" ? "#34d399" : "#f43f5e"}
                    labelColor={miMaquina?.estado === "operativa" ? "#34d399" : "#f43f5e"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario de Producción */}
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
                                {misAsignaciones.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.orden?.numero} — {a.tarea} (Faltan: {a.piezas_requeridas - a.piezas_completadas} uds.)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-orange-400 transition-colors">Unidades Producidas (Buenas)</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={piezasProducidas}
                                onChange={(e) => setPiezasProducidas(Number(e.target.value))}
                                className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all hover:border-slate-700"
                                placeholder="Ej. 10"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-orange-400 transition-colors">Unidades Defectuosas</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={piezasDefectuosas}
                                onChange={(e) => setPiezasDefectuosas(Number(e.target.value))}
                                className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all hover:border-slate-700"
                                placeholder="Ej. 0"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={miMaquina?.estado !== "operativa" || !selectedAsigId}
                            className="w-full mt-4 py-4 rounded-xl font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:hover:shadow-none border border-orange-400/20"
                        >
                            {miMaquina?.estado !== "operativa" ? "Máquina Inactiva - No se puede reportar" : "Guardar Producción"}
                        </button>
                    </form>
                </div>

                {/* Formulario de Falla */}
                <div className="bg-[#13161e] border border-[#1e2130] p-6 rounded-3xl hover:border-slate-800 transition-colors shadow-lg shadow-black/50 flex flex-col">
                    <div className="flex items-center gap-3 mb-6 shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-colors ${miMaquina?.estado === "operativa" ? "bg-[#34d399]/10 text-[#34d399]" : "bg-red-500/10 text-red-500"}`}>
                            {miMaquina?.estado === "operativa" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <h2 className="text-xl font-bold text-white">Estado de la Máquina</h2>
                    </div>

                    <div className="flex-1">
                        {miMaquina?.estado === "operativa" ? (
                            <div className="flex flex-col h-full justify-center">
                                {!showFallaForm ? (
                                    <div className="text-center py-4 animate-in fade-in duration-500">
                                        <div className="w-20 h-20 rounded-full bg-[#34d399]/10 flex items-center justify-center mx-auto mb-6 border border-[#34d399]/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-transform hover:scale-110 duration-500">
                                            <CheckCircle2 className="w-10 h-10 text-[#34d399]" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl mb-2">Máquina Operativa</h3>
                                        <p className="text-slate-400 mb-8 font-medium px-4 text-sm">Si experimentas problemas técnicos, cambia el estado de tu máquina a inactiva.</p>
                                        <button
                                            onClick={() => setShowFallaForm(true)}
                                            className="group flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#1e2130] to-[#13161e] border border-[#1e2130] hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300 active:scale-95"
                                        >
                                            <Wrench className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
                                            <span className="group-hover:text-red-400 transition-colors">Marcar como Inactiva</span>
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReportarFalla} className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-2">
                                            <p className="text-sm font-medium text-red-400">Estás a punto de registrar un reporte de avería para esta máquina. Por favor ingresa los detalles.</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de Fallo</label>
                                                <select
                                                    value={tipoFalla}
                                                    onChange={(e) => setTipoFalla(e.target.value)}
                                                    className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all hover:border-slate-700"
                                                >
                                                    <option value="mecanica">Mecánico</option>
                                                    <option value="electrica">Eléctrico</option>
                                                    <option value="software">Software / Panel</option>
                                                    <option value="otra">Otro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gravedad</label>
                                                <select
                                                    value={gravedad}
                                                    onChange={(e) => setGravedad(e.target.value)}
                                                    className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all hover:border-slate-700"
                                                >
                                                    <option value="leve">Leve (Operativa)</option>
                                                    <option value="moderada">Moderada (Rendimiento bajo)</option>
                                                    <option value="critica">Crítica (Peligro/Parada)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                            <input
                                                type="checkbox"
                                                id="detiene_produccion"
                                                checked={detieneProduccion}
                                                onChange={(e) => setDetieneProduccion(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-700 text-red-500 focus:ring-red-500 focus:ring-opacity-25 cursor-pointer"
                                            />
                                            <label htmlFor="detiene_produccion" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                                                ¿Detiene completamente la producción?
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción del Problema</label>
                                            <textarea
                                                required
                                                value={motivoFalla}
                                                onChange={(e) => setMotivoFalla(e.target.value)}
                                                rows={3}
                                                className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all hover:border-slate-700 resize-none shadow-inner"
                                                placeholder="Describe el problema técnico (ej. aguja rota, ruido extraño en motor)..."
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowFallaForm(false);
                                                    setMotivoFalla("");
                                                    setTipoFalla("mecanica");
                                                    setGravedad("moderada");
                                                    setDetieneProduccion(false);
                                                }}
                                                className="flex-1 py-4 rounded-xl font-bold text-slate-400 border border-[#1e2130] hover:bg-[#1e2130] hover:text-white transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-4 rounded-xl font-black text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/25 active:scale-95"
                                            >
                                                Confirmar Falla
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col h-full justify-center text-center py-4 animate-in fade-in duration-500">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] relative">
                                    <AlertTriangle className="w-10 h-10 text-red-500" />
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">Máquina Fuera de Servicio</h3>
                                <p className="text-slate-400 font-medium px-4">El reporte ha sido enviado. Un técnico o supervisor revisará la máquina pronto.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
