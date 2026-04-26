"use client";
// ─────────────────────────────────────────────────────────────
// app/operarios/page.tsx — RF2 + RF3 (Colores por Máquina)
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Plus, Search, X, Zap, Cpu, Users, UserCheck, UserMinus } from "lucide-react";
import { Operario, TipoMaquina } from "@/types";
import { normalizeText } from "@/utils/formatters"
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore"
import { ModalGestionOperario } from "./componentes/ModalGestionOperarios";
import { ModalAsignacionTarea } from "./componentes/ModalAsignacionTarea";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", slate: "#475569",
};

const MAQUINAS_CFG: Record<TipoMaquina, { label: string; color: string; codigos: string[] }> = {
    merrow: { label: "Merrow", color: "#f97316", codigos: ["MERROW-01", "MERROW-02", "MERROW-03"] },
    cover: { label: "Cover", color: "#818cf8", codigos: ["COVER-01", "COVER-02"] },
    plana: { label: "Plana", color: "#38bdf8", codigos: ["PLANA-01"] },
    corte: { label: "Corte", color: "#fbbf24", codigos: ["CORTE-01", "CORTE-02"] },
    plancha_dtf: { label: "Plancha DTF", color: "#f472b6", codigos: ["DTF-01", "DTF-02"] },
    peso: { label: "Peso/Escala", color: "#34d399", codigos: ["PESO-01"] },
};

const ESTADO_CFG = {
    activo: { color: "#34d399", label: "Activo", bg: "rgba(52,211,153,0.12)", icon: UserCheck },
    inactivo: { color: "#f87171", label: "Inactivo", bg: "rgba(248,113,113,0.12)", icon: UserMinus },
    pendiente: { color: "#e7e7e74b", label: "Pendiente", bg: "rgba(52,211,153,0.12)", icon: UserCheck },
    terminado: { color: "#f70909", label: "Terminado", bg: "rgba(248,113,113,0.12)", icon: UserMinus },
};

// ... (Componente ModalAsignacion se asume implementado externamente)

export default function OperariosPage() {
    const [busqueda, setBusq] = useState("");
    const [asignando, setAsig] = useState<Operario | null>(null);

    const { operarios, isLoading, error } = useOperarioStore();
    const { fetchOperarios, updateOperario } = useOperarioActions();

    useEffect(() => {
        fetchOperarios();
    }, [fetchOperarios]);

    const filtrados = operarios.filter(o =>
        normalizeText(`${o.nombre} ${o.apellido}`).includes(normalizeText(busqueda))
    );

    const total = operarios.length;
    const activos = operarios.filter(o => o.estado === "activo").length;
    const inactivos = total - activos;

    const [modalAbierto, setModalAbierto] = useState(false);

    const handleConfirmarAsignacion = async (maquina: string, orden: string) => {
        if (!asignando) return;
        await updateOperario(asignando.id, {
            maquinaActual: maquina,
            ordenActual: orden,
            estado: "activo" // Al asignar tarea, pasa a estar activo automáticamente
        });

        setAsig(null); // Cerramos modal
    };

    return (
        <div className="flex-1 overflow-auto bg-[#080b10]">
            {modalAbierto && (
                <ModalGestionOperario
                    onClose={() => setModalAbierto(false)}
                    operarios={operarios}
                />
            )}

            {/* MODAL 2: ASIGNACIÓN DE TAREA (EL QUE CREAMOS RECIÉN) */}
            {asignando && (
                <ModalAsignacionTarea
                    operario={asignando}
                    onClose={() => setAsig(null)}
                    onConfirm={handleConfirmarAsignacion}
                />
            )}

            {/* En el mapeo de tus operarios, actualiza el botón de "Asignar Estación" para que también pueda editar: */}
            {/* <button onClick={() => handleOpenGestion(o)} ... > */}
            {asignando && <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
                {/* Placeholder para el Modal de asignación basado en tu lógica previa */}
                <div className="bg-[#13161e] p-6 rounded-2xl border border-[#1e2130] w-full max-w-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white font-bold">Asignar Tarea: {asignando.nombre}</h2>
                        <X className="w-5 h-5 text-slate-500 cursor-pointer" onClick={() => setAsig(null)} />
                    </div>
                    <p className="text-xs text-slate-400 mb-6">Selecciona una estación de trabajo disponible.</p>
                    <button onClick={() => setAsig(null)} className="w-full h-11 bg-orange-500 text-white rounded-xl font-bold">Confirmar</button>
                </div>
            </div>}

            <div className="px-6 py-5 border-b flex items-center justify-between bg-[#13161e]" style={{ borderColor: C.border }}>
                <div>
                    <h1 className="text-lg font-black text-white">Operarios & Rendimiento</h1>
                    <p className="text-xs mt-0.5 text-slate-500 font-medium">Gestión de recursos humanos en planta</p>
                </div>
                <button onClick={() => setModalAbierto(true)} className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold bg-orange-500 cursor-pointer hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" /> Gestionar operarios
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Plantilla", valor: total, icon: Users, color: "#fff" },
                        { label: "En Turno", valor: activos, icon: UserCheck, color: C.emerald },
                        { label: "Inactivos", valor: inactivos, icon: UserMinus, color: C.red },
                    ].map((k, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border bg-[#13161e]/50 flex items-center gap-4" style={{ borderColor: C.border }}>
                            <div className="p-3 rounded-xl bg-white/5"><k.icon className="w-5 h-5" style={{ color: k.color }} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{k.label}</p>
                                <p className="text-2xl font-black text-white">{k.valor}</p>
                            </div>
                        </div>
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
                        const est = ESTADO_CFG[o.estado];
                        return (
                            <div key={o.id} className="rounded-2xl border bg-[#13161e] overflow-hidden flex flex-col hover:border-white/10 transition-colors" style={{ borderColor: C.border }}>
                                <div className="p-4 border-b flex items-center gap-4" style={{ borderColor: C.border }}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black bg-[#0d1018] text-white border border-white/5">
                                        {o.nombre[0]}{o.apellido[0]}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white">{o.nombre} {o.apellido}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/5 text-slate-500 uppercase">ID-{o.id}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: est.bg, color: est.color }}>{est.label}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-4 flex-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Rendimiento por Máquina
                                    </p>

                                    <div className="space-y-3">
                                        {o.habilidades.map(hab => {
                                            const cfg = MAQUINAS_CFG[hab.maquina];
                                            const colorBarra = hab.nivelEficiencia >= 85 ? C.emerald : hab.nivelEficiencia >= 70 ? C.amber : C.red;
                                            return (
                                                <div key={hab.maquina}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        {/* Color de la máquina aplicado al texto del label */}
                                                        <span className="text-xs font-bold capitalize flex items-center gap-2" style={{ color: cfg.color }}>
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                                                            {cfg.label}
                                                        </span>
                                                        <span className="text-[10px] font-bold font-mono" style={{ color: colorBarra }}>{hab.nivelEficiencia}%</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-1000"
                                                            style={{ width: `${hab.nivelEficiencia}%`, background: colorBarra }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {o.estado === "activo" && o.maquinaActual && (
                                        <div className="mt-4 p-3 rounded-xl bg-[#0d1018] border border-white/5 flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                <Cpu className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Estación Activa</p>
                                                {/* Color dinámico basado en el tipo de máquina actual */}
                                                <p className="text-xs font-black truncate" style={{
                                                    color: MAQUINAS_CFG[o.maquinaActual.split('-')[0].toLowerCase() as TipoMaquina]?.color || '#fff'
                                                }}>
                                                    {o.maquinaActual}
                                                </p>
                                                <p className="text-[10px] text-slate-500 truncate font-medium">{o.ordenActual}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="px-4 pb-4 mt-auto">
                                    <button onClick={() => setAsig(o)}
                                        className="w-full h-10 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                                        {o.maquinaActual ? "Reasignar Tarea" : "Asignar Estación"}
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