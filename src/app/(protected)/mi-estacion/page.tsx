"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { StatCard } from "@/components/StatCard";
import { AppColors } from "@/shared/constants";
import { CheckCircle2, AlertTriangle, Factory, Zap, Wrench, ClipboardList, Calendar } from "lucide-react";

export default function MiEstacionPage() {
    const { user } = useAuthStore();

    const { operarios, isLoading: loadingOperarios } = useOperarioStore();
    const { fetchOperarios } = useOperarioActions();

    const { maquinas, isLoading: loadingMaquinas } = useMaquinasStore();
    const { fetchMaquinas, updateMaquina } = useMaquinasActions();

    // Derivamos el operario y la máquina directamente del estado de los stores
    const miOperario = user && operarios.length > 0
        ? operarios.find(o => o.correo === user.correo || o.nombre === user.nombre) || null
        : null;

    const miMaquina = miOperario?.maquinaActual && maquinas.length > 0
        ? maquinas.find(m => m.tipo === miOperario.maquinaActual) || null
        : null;

    // Form states
    const [piezasProducidas, setPiezasProducidas] = useState<number | "">("");
    const [piezasDefectuosas, setPiezasDefectuosas] = useState<number | "">("");
    const [motivoFalla, setMotivoFalla] = useState("");
    const [showFallaForm, setShowFallaForm] = useState(false);

    useEffect(() => {
        fetchOperarios();
        fetchMaquinas();
    }, [fetchOperarios, fetchMaquinas]);

    const handleReportarProduccion = (e: React.FormEvent) => {
        e.preventDefault();
        if (piezasProducidas === "" || piezasDefectuosas === "") return;

        // Simular envío
        alert(`Reporte enviado: ${piezasProducidas} buenas, ${piezasDefectuosas} defectuosas.`);
        setPiezasProducidas("");
        setPiezasDefectuosas("");
    };

    const handleReportarFalla = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!miMaquina || motivoFalla.trim() === "") return;

        const success = await updateMaquina(miMaquina.id, {
            estado: "mantenimiento",
            // Podríamos guardar el motivo en un registro, pero por ahora cambiamos el estado
        });

        if (success) {
            alert(`Falla reportada exitosamente en ${miMaquina.nombre}. La máquina está ahora en mantenimiento.`);
            setMotivoFalla("");
            setShowFallaForm(false);
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

            {/* Contexto de Tarea / Orden Asignada */}
            {miOperario.orden_actual_id && (
                <div className="mb-8 bg-gradient-to-r from-[#818cf8]/20 to-[#818cf8]/5 border border-[#818cf8]/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-[#818cf8]/10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#818cf8]/20 flex items-center justify-center text-[#818cf8] shadow-inner">
                            <ClipboardList className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#818cf8] mb-1">Orden de Producción Activa</p>
                            <p className="text-2xl font-black text-white">{miOperario.orden_actual_id}</p>
                        </div>
                    </div>
                </div>
            )}

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
                        <h2 className="text-xl font-bold text-white">Reporte de Producción</h2>
                    </div>

                    <form onSubmit={handleReportarProduccion} className="space-y-5">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-orange-400 transition-colors">Unidades Producidas (Buenas)</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={piezasProducidas}
                                onChange={(e) => setPiezasProducidas(Number(e.target.value))}
                                className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all hover:border-slate-700"
                                placeholder="Ej. 50"
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
                                placeholder="Ej. 2"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={miMaquina?.estado !== "operativa"}
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
                                            <p className="text-sm font-medium text-red-400">Estás a punto de reportar la máquina como inactiva. Por favor describe la falla.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Motivo de la Inactividad / Falla</label>
                                            <textarea
                                                required
                                                value={motivoFalla}
                                                onChange={(e) => setMotivoFalla(e.target.value)}
                                                rows={3}
                                                className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all hover:border-slate-700 resize-none shadow-inner"
                                                placeholder="Ej. Ruido en el motor, aguja rota, recalentamiento..."
                                            />
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => { setShowFallaForm(false); setMotivoFalla(""); }}
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
