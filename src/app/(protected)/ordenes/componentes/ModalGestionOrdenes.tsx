"use client";

import { X } from "lucide-react";
import { useState } from "react";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
};

// ── Modal nueva orden ──────────────────────────────────────

export function ModalGestionOrdenes({ onClose }: { onClose: () => void }) {
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