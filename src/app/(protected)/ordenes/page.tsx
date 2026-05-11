"use client";
// ─────────────────────────────────────────────────────────────
// app/ordenes/page.tsx — RF1 (CRUD órdenes) + RF7 (cola drag)
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import {
    Plus, Search,
    Clock, CheckCircle2, Pause,
    ArrowUpDown,
} from "lucide-react";
import { ModalGestionOrdenes } from "./componentes/ModalGestionOrdenes";
import { EstadoOrden } from "@/types";
import { useOrdenActions, useOrdenStore } from "@/features/ordenes/store/useOrdenesStore";
import { AppColors } from "@/shared/constants";
import { ColaPrioridadesOrdenes } from "./componentes/ColaPrioridadOrdenes";
import { TablaOrdenes } from "./componentes/TablaOrdenes";


const ESTADO_CFG: Record<EstadoOrden, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pendiente: { label: "Pendiente", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    en_proceso: { label: "En proceso", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    pausada: { label: "Pausada", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <Pause className="w-3.5 h-3.5" /> },
    completada: { label: "Completada", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

// ── Página principal ───────────────────────────────────────

export default function OrdenesPage() {
    const { ordenes } = useOrdenStore()
    const { fetchOrdenes, updateCola } = useOrdenActions();

    useEffect(() => {
        fetchOrdenes();
    }, [fetchOrdenes]);

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltro] = useState<EstadoOrden | "todas">("todas");
    const [modal, setModal] = useState(false);
    const [vistaTab, setVistaTab] = useState<"lista" | "cola">("lista");

    const filtradas = ordenes.filter(o => {
        const matchBusq = o.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
            o.cliente.toLowerCase().includes(busqueda.toLowerCase());
        const matchEst = filtroEstado === "todas" || o.estado === filtroEstado;
        return matchBusq && matchEst;
    });

    // Cola ordenada por posición (excluye completadas)
    const colaActiva = useMemo(() => {
        return [...ordenes]
            .filter(o => o.estado !== "completada")
            .sort((a, b) => (a.cola ?? 0) - (b.cola ?? 0));
    }, [ordenes]); // Solo se recalcula si 'ordenes' cambia

    return (
        <div className="flex-1 overflow-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {modal && <ModalGestionOrdenes onClose={() => setModal(false)} />}

            {/* Header de página */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: AppColors.border, background: AppColors.surface }}>
                <div>
                    <h1 className="text-lg font-black text-white">Órdenes de Producción</h1>
                    <p className="text-xs mt-0.5" style={{ color: AppColors.slate }}>RF1 · RF7 — Gestión y cola de prioridades</p>
                </div>
                <button onClick={() => setModal(true)}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm  font-bold cursor-pointer hover:scale-105 transition-transform "
                    style={{ background: AppColors.orange, boxShadow: `0 4px 16px ${AppColors.orange}30` }}>
                    <Plus className="w-4 h-4" /> Gestionar Ordenes
                </button>
            </div>

            <div className="p-6 space-y-5">

                {/* Stats rápidas */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Total activas", valor: ordenes.filter(o => o.estado === "en_proceso").length, color: AppColors.orange },
                        { label: "MTO pendientes", valor: ordenes.filter(o => o.tipo === "MTO" && o.estado !== "completada").length, color: "#818cf8" },
                        { label: "Completadas hoy", valor: ordenes.filter(o => o.estado === "completada").length, color: AppColors.emerald },
                        { label: "En pausa", valor: ordenes.filter(o => o.estado === "pausada").length, color: AppColors.amber },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl px-4 py-3"
                            style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <p className="text-xs mb-1" style={{ color: AppColors.slate }}>{s.label}</p>
                            <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.valor}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs Lista / Cola */}
                <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                    {(["lista", "cola"] as const).map(t => (
                        <button key={t} onClick={() => setVistaTab(t)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
                            style={{ background: vistaTab === t ? AppColors.orange : "transparent", color: vistaTab === t ? "#fff" : AppColors.slate }}>
                            {t === "lista" ? "📋 Lista" : "🔢 Cola de prioridad"}
                        </button>
                    ))}
                </div>

                {vistaTab === "lista" && (
                    <>
                        {/* Filtros */}
                        <div className="flex gap-3 flex-wrap">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: AppColors.slate }} />
                                <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                                    placeholder="Buscar por número o cliente..."
                                    className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white focus:outline-none"
                                    style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }} />
                            </div>
                            <div className="flex gap-2">
                                {(["todas", "pendiente", "en_proceso", "pausada", "completada"] as const).map(e => (
                                    <button key={e} onClick={() => setFiltro(e)}
                                        className="h-10 px-3 rounded-xl text-xs font-semibold transition-all"
                                        style={{
                                            background: filtroEstado === e ? `${AppColors.orange}18` : AppColors.surface,
                                            color: filtroEstado === e ? AppColors.orange : "#94a3b8",
                                            border: `1px solid ${filtroEstado === e ? AppColors.orange : AppColors.border}`,
                                        }}>
                                        {e === "todas" ? "Todas" : ESTADO_CFG[e].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Tabla de órdenes */}
                        <TablaOrdenes ordenes={filtradas} />
                    </>
                )}

                {vistaTab === "cola" && (
                    <div className="animate-in slide-in-from-bottom-2 duration-400">
                        <ColaPrioridadesOrdenes
                            ordenes={colaActiva}
                            onReorder={async (nuevaLista) => {
                                await updateCola(nuevaLista);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}