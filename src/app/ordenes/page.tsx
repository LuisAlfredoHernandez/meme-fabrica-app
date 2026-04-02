"use client";
// ─────────────────────────────────────────────────────────────
// app/ordenes/page.tsx — RF1 (CRUD órdenes) + RF7 (cola drag)
// ─────────────────────────────────────────────────────────────
import {
    Orden,
    ORDENES_MOCK,
    Prioridad,
    TipoOP,
    EstadoOrden,
} from "@/features/ordenes/services/ordenes.service";
import { useState } from "react";
import {
    Plus, Search, Filter, GripVertical, ChevronDown,
    Clock, AlertCircle, CheckCircle2, Pause, X,
    ArrowUpDown, Package, Calendar, User, Tag,
} from "lucide-react";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
};

const ESTADO_CFG: Record<EstadoOrden, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pendiente: { label: "Pendiente", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    en_proceso: { label: "En proceso", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    pausada: { label: "Pausada", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <Pause className="w-3.5 h-3.5" /> },
    completada: { label: "Completada", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};
const PRIORIDAD_CFG: Record<Prioridad, { color: string }> = {
    baja: { color: "#64748b" },
    normal: { color: "#94a3b8" },
    alta: { color: "#fbbf24" },
    urgente: { color: "#f87171" },
};

// ── Modal nueva orden ──────────────────────────────────────

function ModalNuevaOrden({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
        cliente: "", tipo: "MTO", prenda: "", cantidad: "", prioridad: "normal", fechaEntrega: "",
    });
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>

                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <h2 className="font-bold text-white">Nueva Orden de Producción</h2>
                    <button onClick={onClose} style={{ color: C.slate }}><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Tipo MTO / MTS */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Tipo de Orden</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["MTO", "MTS"] as const).map(t => (
                                <button key={t} onClick={() => set("tipo", t)}
                                    className="py-3 rounded-xl border-2 font-bold text-sm transition-all"
                                    style={{
                                        borderColor: form.tipo === t ? C.orange : C.border,
                                        color: form.tipo === t ? C.orange : "#94a3b8",
                                        background: form.tipo === t ? `${C.orange}12` : "transparent",
                                    }}>
                                    {t === "MTO" ? "MTO — Pedido cliente" : "MTS — Stock interno"}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs" style={{ color: C.slate }}>
                            {form.tipo === "MTO" ? "Prioridad sobre órdenes MTS. Fecha de entrega comprometida." : "Producción para inventario. Puede pausarse por MTO urgente."}
                        </p>
                    </div>

                    {/* Cliente */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
                            {form.tipo === "MTO" ? "Cliente" : "Descripción"}
                        </label>
                        <input value={form.cliente} onChange={e => set("cliente", e.target.value)}
                            placeholder={form.tipo === "MTO" ? "Nombre del cliente" : "Ej: Stock temporada alta"}
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                            style={{ background: "#0d1018", border: `1.5px solid ${form.cliente ? C.orange : C.border}` }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Prenda */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Tipo de prenda</label>
                            <select value={form.prenda} onChange={e => set("prenda", e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.prenda ? C.orange : C.border}` }}>
                                <option value="">— Selecciona —</option>
                                {["Licra deportiva", "Jogger", "Vestido", "T-shirt", "Short", "Blusa", "Otro"].map(p =>
                                    <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        {/* Cantidad */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Cantidad (piezas)</label>
                            <input type="number" min={1} value={form.cantidad} onChange={e => set("cantidad", e.target.value)}
                                placeholder="100"
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.cantidad ? C.orange : C.border}` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Prioridad */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Prioridad</label>
                            <select value={form.prioridad} onChange={e => set("prioridad", e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }}>
                                {["baja", "normal", "alta", "urgente"].map(p =>
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                            </select>
                        </div>
                        {/* Fecha entrega */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Fecha de entrega</label>
                            <input type="date" value={form.fechaEntrega} onChange={e => set("fechaEntrega", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.fechaEntrega ? C.orange : C.border}` }} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose}
                        className="flex-1 h-11 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: C.border, color: "#94a3b8" }}>Cancelar</button>
                    <button className="flex-1 h-11 rounded-xl text-white text-sm font-bold"
                        style={{ background: C.orange, boxShadow: `0 4px 16px ${C.orange}40` }}>
                        Crear Orden
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Página principal ───────────────────────────────────────

export default function OrdenesPage() {
    const [ordenes, setOrdenes] = useState(ORDENES_MOCK);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltro] = useState<EstadoOrden | "todas">("todas");
    const [modal, setModal] = useState(false);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [vistaTab, setVistaTab] = useState<"lista" | "cola">("lista");

    const filtradas = ordenes.filter(o => {
        const matchBusq = o.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
            o.cliente.toLowerCase().includes(busqueda.toLowerCase());
        const matchEst = filtroEstado === "todas" || o.estado === filtroEstado;
        return matchBusq && matchEst;
    });

    // Cola ordenada por posición (excluye completadas)
    const colaActiva = [...ordenes]
        .filter(o => o.estado !== "completada")
        .sort((a, b) => a.cola - b.cola);

    // Drag-and-drop simple para reordenar cola (RF7)
    const handleDragStart = (idx: number) => setDragIdx(idx);
    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;
        const nueva = [...colaActiva];
        const [moved] = nueva.splice(dragIdx, 1);
        nueva.splice(idx, 0, moved);
        nueva.forEach((o, i) => { o.cola = i + 1; });
        setOrdenes(prev => prev.map(o => {
            const found = nueva.find(n => n.id === o.id);
            return found ? { ...o, cola: found.cola } : o;
        }));
        setDragIdx(idx);
    };

    return (
        <div className="flex-1 overflow-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {modal && <ModalNuevaOrden onClose={() => setModal(false)} />}

            {/* Header de página */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border, background: C.surface }}>
                <div>
                    <h1 className="text-lg font-black text-white">Órdenes de Producción</h1>
                    <p className="text-xs mt-0.5" style={{ color: C.slate }}>RF1 · RF7 — Gestión y cola de prioridades</p>
                </div>
                <button onClick={() => setModal(true)}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold transition-all"
                    style={{ background: C.orange, boxShadow: `0 4px 16px ${C.orange}30` }}>
                    <Plus className="w-4 h-4" /> Nueva Orden
                </button>
            </div>

            <div className="p-6 space-y-5">

                {/* Stats rápidas */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Total activas", valor: ordenes.filter(o => o.estado === "en_proceso").length, color: C.orange },
                        { label: "MTO pendientes", valor: ordenes.filter(o => o.tipo === "MTO" && o.estado !== "completada").length, color: "#818cf8" },
                        { label: "Completadas hoy", valor: ordenes.filter(o => o.estado === "completada").length, color: C.emerald },
                        { label: "En pausa", valor: ordenes.filter(o => o.estado === "pausada").length, color: C.amber },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl px-4 py-3"
                            style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <p className="text-xs mb-1" style={{ color: C.slate }}>{s.label}</p>
                            <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.valor}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs Lista / Cola */}
                <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                    {(["lista", "cola"] as const).map(t => (
                        <button key={t} onClick={() => setVistaTab(t)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: vistaTab === t ? C.orange : "transparent", color: vistaTab === t ? "#fff" : C.slate }}>
                            {t === "lista" ? "📋 Lista" : "🔢 Cola de prioridad"}
                        </button>
                    ))}
                </div>

                {vistaTab === "lista" && (
                    <>
                        {/* Filtros */}
                        <div className="flex gap-3 flex-wrap">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.slate }} />
                                <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                                    placeholder="Buscar por número o cliente..."
                                    className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white focus:outline-none"
                                    style={{ background: C.surface, border: `1px solid ${C.border}` }} />
                            </div>
                            <div className="flex gap-2">
                                {(["todas", "pendiente", "en_proceso", "pausada", "completada"] as const).map(e => (
                                    <button key={e} onClick={() => setFiltro(e)}
                                        className="h-10 px-3 rounded-xl text-xs font-semibold transition-all"
                                        style={{
                                            background: filtroEstado === e ? `${C.orange}18` : C.surface,
                                            color: filtroEstado === e ? C.orange : "#94a3b8",
                                            border: `1px solid ${filtroEstado === e ? C.orange : C.border}`,
                                        }}>
                                        {e === "todas" ? "Todas" : ESTADO_CFG[e].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabla de órdenes */}
                        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: C.surface }}>
                                        {["Orden / Cliente", "Tipo", "Prenda", "Avance", "Estado", "Prioridad", "Entrega"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: C.slate }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtradas.map((o, i) => {
                                        const pct = Math.round((o.completadas / o.cantidad) * 100);
                                        const est = ESTADO_CFG[o.estado];
                                        const prio = PRIORIDAD_CFG[o.prioridad];
                                        return (
                                            <tr key={o.id} className="border-t transition-colors hover:opacity-90"
                                                style={{ borderColor: C.border, background: i % 2 === 0 ? C.bg : `${C.surface}80` }}>
                                                <td className="px-4 py-3">
                                                    <p className="font-mono text-xs font-bold" style={{ color: C.orange }}>{o.numero}</p>
                                                    <p className="text-xs text-white mt-0.5">{o.cliente}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                                                        style={{
                                                            background: o.tipo === "MTO" ? "rgba(129,140,248,0.15)" : "rgba(100,116,139,0.15)",
                                                            color: o.tipo === "MTO" ? "#818cf8" : "#94a3b8"
                                                        }}>{o.tipo}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-white">{o.prenda}</td>
                                                <td className="px-4 py-3 min-w-32">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? C.emerald : C.orange }} />
                                                        </div>
                                                        <span className="text-xs font-mono" style={{ color: pct >= 100 ? C.emerald : "#94a3b8" }}>
                                                            {o.completadas}/{o.cantidad}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                                                        style={{ background: est.bg, color: est.color }}>
                                                        {est.icon}{est.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-bold capitalize" style={{ color: prio.color }}>{o.prioridad}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>{o.fechaEntrega}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filtradas.length === 0 && (
                                <div className="py-12 text-center" style={{ color: C.slate }}>
                                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No se encontraron órdenes</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {vistaTab === "cola" && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                            style={{ background: "rgba(249,115,22,0.08)", border: `1px solid rgba(249,115,22,0.25)`, color: C.orange }}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Arrastra las órdenes para reordenar la cola de producción. Las MTO siempre tienen precedencia sobre MTS.
                        </div>
                        {colaActiva.map((o, idx) => {
                            const est = ESTADO_CFG[o.estado];
                            const pct = Math.round((o.completadas / o.cantidad) * 100);
                            return (
                                <div key={o.id} draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={e => handleDragOver(e, idx)}
                                    onDragEnd={() => setDragIdx(null)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all"
                                    style={{
                                        background: dragIdx === idx ? `${C.orange}10` : C.surface,
                                        borderColor: dragIdx === idx ? C.orange : C.border,
                                    }}>
                                    <GripVertical className="w-5 h-5 shrink-0" style={{ color: C.slate }} />
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                                        style={{ background: `${C.orange}20`, color: C.orange }}>{o.cola}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold" style={{ color: C.orange }}>{o.numero}</span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{
                                                    background: o.tipo === "MTO" ? "rgba(129,140,248,0.15)" : "rgba(100,116,139,0.15)",
                                                    color: o.tipo === "MTO" ? "#818cf8" : "#94a3b8"
                                                }}>{o.tipo}</span>
                                            <span className="text-xs font-bold capitalize" style={{ color: PRIORIDAD_CFG[o.prioridad].color }}>
                                                {o.prioridad}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white font-medium mt-0.5">{o.cliente} · {o.prenda}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="w-32 h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.orange }} />
                                            </div>
                                            <span className="text-xs" style={{ color: "#94a3b8" }}>{pct}%</span>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                                        style={{ background: est.bg, color: est.color }}>
                                        {est.icon}{est.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}