"use client";
// ─────────────────────────────────────────────────────────────
// app/operarios/page.tsx — Gestión de Operarios y Asignación de Órdenes/Tareas
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Search, X, Zap, Cpu, Users, UserCheck, UserMinus, ClipboardList } from "lucide-react";
import { Operario, TipoMaquina } from "@/types";
import { normalizeText } from "@/utils/formatters";
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useAsignacionStore, useAsignacionActions } from "@/features/operarios/store/useAsignacionStore";
import { ModalGestionOperario } from "./componentes/ModalGestionOperarios";
import { ModalAsignacionTarea } from "./componentes/ModalAsignacionTarea";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

const MAQUINAS_CFG: Record<TipoMaquina, { label: string; color: string; codigos: string[] }> = {
    merrow: { label: "Merrow", color: "#f97316", codigos: ["MERROW-01", "MERROW-02", "MERROW-03"] },
    cover: { label: "Cover", color: "#818cf8", codigos: ["COVER-01", "COVER-02"] },
    plana: { label: "Plana", color: "#38bdf8", codigos: ["PLANA-01"] },
    corte: { label: "Corte", color: "#fbbf24", codigos: ["CORTE-01", "CORTE-02"] },
    plancha_dtf: { label: "Plancha DTF", color: "#f472b6", codigos: ["DTF-01", "DTF-02"] },
    otro: { label: "Otro", color: "#94a3b8", codigos: ["OTRO-01"] },
};

const ESTADO_CFG = {
    activo: { color: "#34d399", label: "Activo", bg: "rgba(52,211,153,0.12)", icon: UserCheck },
    inactivo: { color: "#f87171", label: "Inactivo", bg: "rgba(248,113,113,0.12)", icon: UserMinus },
    pendiente: { color: "#e7e7e74b", label: "Pendiente", bg: "rgba(52,211,153,0.12)", icon: UserCheck },
    terminado: { color: "#f70909", label: "Terminado", bg: "rgba(248,113,113,0.12)", icon: UserMinus },
};

export default function OperariosPage() {
    const [busqueda, setBusq] = useState("");
    const [asignando, setAsig] = useState<Operario | null>(null);

    const { operarios } = useOperarioStore();
    const { fetchOperarios, updateOperario } = useOperarioActions();

    const { asignaciones } = useAsignacionStore();
    const { fetchAsignaciones, updateAsignacion } = useAsignacionActions();

    useEffect(() => {
        fetchOperarios();
        fetchAsignaciones();
    }, [fetchOperarios, fetchAsignaciones]);

    const filtrados = operarios.filter(o =>
        normalizeText(`${o.nombre} ${o.apellido}`).includes(normalizeText(busqueda))
    );

    const total = operarios.length;
    const activos = operarios.filter(o => o.estado === "activo").length;
    const inactivos = total - activos;

    const [modalAbierto, setModalAbierto] = useState(false);

    const handleConfirmarAsignacion = async (asignacionId: string, ordenId: string, maquinaId: string) => {
        if (!asignando || !asignando.id) return;

        const success = await updateAsignacion(asignacionId, {
            estado: "en_proceso",
        });

        if (success) {
            // Actualizar el estado del operario y vincular a la orden más reciente
            await updateOperario(asignando.id, {
                orden_actual_id: ordenId,
                estado: "activo",
                maquina_actual_id: maquinaId || null
            });
        }
        setAsig(null); // Cerramos modal
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 text-white max-h-screen custom-scrollbar">
            {modalAbierto && (
                <ModalGestionOperario
                    onClose={() => setModalAbierto(false)}
                    operarios={operarios}
                />
            )}

            {/* Modal de Asignación */}
            {asignando && (
                <ModalAsignacionTarea
                    operario={asignando}
                    onClose={() => setAsig(null)}
                    onConfirm={handleConfirmarAsignacion}
                />
            )}

            {/* Header pantalla */}
            <Header title={"Operarios & Rendimiento"} subtitle="Gestión de recursos humanos en planta" buttonLabel={"Gestionar operarios"} onButtonClick={() => setModalAbierto(true)} />

            {/* Card de status de operarios */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Plantilla", valor: total, icon: Users, color: "#fff" },
                        { label: "En Turno", valor: activos, icon: UserCheck, color: AppColors.emerald },
                        { label: "Inactivos", valor: inactivos, icon: UserMinus, color: AppColors.red },
                    ].map((k, idx) => (
                        <StatCard key={idx} valor={k.valor} label={k.label} icon={k.icon} color={k.color} />
                    ))}
                </div>

                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={busqueda}
                        onChange={e => setBusq(e.target.value)}
                        placeholder="Buscar operario..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm text-white bg-[#13161e] border border-[#1e2130] focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtrados.map(o => {
                        const est = ESTADO_CFG[o.estado] || ESTADO_CFG.pendiente;
                        const oAsignaciones = asignaciones.filter(a => a.operario_id === o.id);

                        return (
                            <div key={o.id} className="rounded-2xl border bg-[#13161e] overflow-hidden flex flex-col hover:border-white/10 transition-colors" style={{ borderColor: AppColors.border }}>
                                <div className="p-4 border-b flex items-center gap-4" style={{ borderColor: AppColors.border }}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black bg-[#0d1018] text-white border border-white/5">
                                        {o.nombre[0]}{o.apellido[0]}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white">{o.nombre} {o.apellido}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/5 text-slate-500 uppercase">ID-{o.id?.slice(0, 5)}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: est.bg, color: est.color }}>{est.label}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-4 flex-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Rendimiento por Máquina
                                    </p>

                                    <div className="space-y-3 border-b pb-4" style={{ borderColor: AppColors.border }}>
                                        {o.habilidades.map(hab => {
                                            const cfg = MAQUINAS_CFG[hab.maquina] || MAQUINAS_CFG.otro;
                                            const nivel = hab.nivel_eficiencia ?? 0;
                                            const colorBarra = nivel >= 85 ? AppColors.emerald : nivel >= 70 ? AppColors.amber : AppColors.red;
                                            return (
                                                <div key={hab.maquina + (hab.nivel_eficiencia ?? 0)}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold capitalize flex items-center gap-2" style={{ color: cfg.color }}>
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                                                            {cfg.label}
                                                        </span>
                                                        <span className="text-[10px] font-bold font-mono" style={{ color: colorBarra }}>{nivel}%</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-1000"
                                                            style={{ width: `${nivel}%`, background: colorBarra }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Listado de Tareas Asignadas */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <ClipboardList className="w-3.5 h-3.5 text-orange-500" /> Órdenes Asignadas ({oAsignaciones.length})
                                        </p>

                                        {oAsignaciones.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                {oAsignaciones.map(asig => {
                                                    const pct = asig.piezas_requeridas > 0 ? Math.round((asig.piezas_completadas / asig.piezas_requeridas) * 100) : 0;
                                                    return (
                                                        <div key={asig.id} className="p-3 rounded-xl bg-[#0d1018] border border-white/5 space-y-1.5">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[9px] font-black text-orange-400 font-mono uppercase tracking-tight">
                                                                        {asig.orden?.numero || 'ORD-N/A'}
                                                                    </p>
                                                                    <p className="text-xs font-bold text-white truncate">{asig.tarea}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                                                                <span>Progreso: {asig.piezas_completadas}/{asig.piezas_requeridas} uds.</span>
                                                                <span className="font-bold text-slate-300 font-mono">{pct}%</span>
                                                            </div>
                                                            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                                                <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-xl bg-[#0d1018]/50 border border-white/5 text-center text-xs text-slate-500 font-semibold italic">
                                                Sin tareas asignadas
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-4 pb-4 mt-auto">
                                    <button onClick={() => setAsig(o)}
                                        className="w-full h-10 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                                        Asignar Tarea / Orden
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}