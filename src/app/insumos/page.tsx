"use client";
// ─────────────────────────────────────────────────────────────
// app/insumos/page.tsx — RF6 · Gestión de insumos y materiales
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Plus, AlertTriangle, Search, Package, X, TrendingDown } from "lucide-react";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
};

type TipoInsumo = "tela" | "accesorio";

interface Insumo {
    id: string; nombre: string; tipo: TipoInsumo; subtipo: string;
    unidad: string; stock: number; minimo: number; proveedor: string;
    vinculadoA: string[];
}

const INSUMOS_MOCK: Insumo[] = [
    { id: "i1", nombre: "Tela micro azul rey", tipo: "tela", subtipo: "micro", unidad: "metros", stock: 45, minimo: 20, proveedor: "Textiles RD", vinculadoA: ["ORD-2026-0042"] },
    { id: "i2", nombre: "Tela licra negra", tipo: "tela", subtipo: "licra", unidad: "metros", stock: 12, minimo: 15, proveedor: "ImportaTex", vinculadoA: ["ORD-2026-0043"] },
    { id: "i3", nombre: "Tela mono beige", tipo: "tela", subtipo: "mono", unidad: "metros", stock: 80, minimo: 10, proveedor: "Textiles RD", vinculadoA: ["ORD-2026-0044"] },
    { id: "i4", nombre: "Zippers negros #5", tipo: "accesorio", subtipo: "zipper", unidad: "unidades", stock: 320, minimo: 100, proveedor: "AccesoriosDO", vinculadoA: ["ORD-2026-0042"] },
    { id: "i5", nombre: "Gomas elásticas 2cm", tipo: "accesorio", subtipo: "goma", unidad: "metros", stock: 8, minimo: 20, proveedor: "ElásticosCaribeño", vinculadoA: ["ORD-2026-0043"] },
    { id: "i6", nombre: "Hilo poliéster negro", tipo: "accesorio", subtipo: "hilo", unidad: "rollos", stock: 15, minimo: 8, proveedor: "HilosNatl", vinculadoA: ["ORD-2026-0042", "ORD-2026-0043"] },
    { id: "i7", nombre: "Botones metálicos 18mm", tipo: "accesorio", subtipo: "boton", unidad: "unidades", stock: 0, minimo: 50, proveedor: "AccesoriosDO", vinculadoA: [] },
];

function stockStatus(stock: number, minimo: number) {
    if (stock === 0) return { color: C.red, label: "Agotado", bg: `${C.red}15` };
    if (stock < minimo) return { color: C.amber, label: "Stock bajo", bg: `${C.amber}15` };
    return { color: C.emerald, label: "Disponible", bg: `${C.emerald}15` };
}

function ModalNuevoInsumo({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ nombre: "", tipo: "tela", subtipo: "", unidad: "metros", stock: "", minimo: "", proveedor: "" });
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <h2 className="font-bold text-white">Nuevo Insumo</h2>
                    <button onClick={onClose} style={{ color: C.slate }}><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Nombre del insumo</label>
                        <input value={form.nombre} onChange={e => set("nombre", e.target.value)}
                            placeholder="Ej: Tela micro azul rey"
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                            style={{ background: "#0d1018", border: `1.5px solid ${form.nombre ? C.orange : C.border}` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Tipo</label>
                            <select value={form.tipo} onChange={e => set("tipo", e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }}>
                                <option value="tela">Tela</option>
                                <option value="accesorio">Accesorio</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Unidad</label>
                            <select value={form.unidad} onChange={e => set("unidad", e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }}>
                                {["metros", "unidades", "rollos", "kg"].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Stock actual</label>
                            <input type="number" min={0} value={form.stock} onChange={e => set("stock", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.stock ? C.orange : C.border}` }} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Stock mínimo</label>
                            <input type="number" min={0} value={form.minimo} onChange={e => set("minimo", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.minimo ? C.orange : C.border}` }} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Proveedor</label>
                        <input value={form.proveedor} onChange={e => set("proveedor", e.target.value)}
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                            style={{ background: "#0d1018", border: `1.5px solid ${form.proveedor ? C.orange : C.border}` }} />
                    </div>
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose}
                        className="flex-1 h-11 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: C.border, color: "#94a3b8" }}>Cancelar</button>
                    <button className="flex-1 h-11 rounded-xl text-white text-sm font-bold"
                        style={{ background: C.orange }}>Registrar insumo</button>
                </div>
            </div>
        </div>
    );
}

export default function InsumosPage() {
    const [insumos] = useState(INSUMOS_MOCK);
    const [busqueda, setBusq] = useState("");
    const [modal, setModal] = useState(false);
    const [filtro, setFiltro] = useState<"todos" | "bajo" | "agotado">("todos");

    const filtrados = insumos.filter(i => {
        const matchBusq = i.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const st = stockStatus(i.stock, i.minimo);
        const matchFilt = filtro === "todos" ||
            (filtro === "agotado" && i.stock === 0) ||
            (filtro === "bajo" && i.stock > 0 && i.stock < i.minimo);
        return matchBusq && matchFilt;
    });

    const alertas = insumos.filter(i => i.stock < i.minimo);

    return (
        <div className="flex-1 overflow-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {modal && <ModalNuevoInsumo onClose={() => setModal(false)} />}

            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border, background: C.surface }}>
                <div>
                    <h1 className="text-lg font-black text-white">Insumos y Materiales</h1>
                    <p className="text-xs mt-0.5" style={{ color: C.slate }}>RF6 — Inventario vinculado a órdenes</p>
                </div>
                <button onClick={() => setModal(true)}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold"
                    style={{ background: C.orange }}>
                    <Plus className="w-4 h-4" /> Nuevo insumo
                </button>
            </div>

            <div className="p-6 space-y-5">

                {/* Alerta de stock crítico */}
                {alertas.length > 0 && (
                    <div className="flex items-start gap-3 px-5 py-4 rounded-xl"
                        style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)" }}>
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.amber }} />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: C.amber }}>
                                {alertas.length} insumo{alertas.length > 1 ? "s" : ""} por debajo del stock mínimo
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: C.slate }}>
                                {alertas.map(a => a.nombre).join(" · ")}
                            </p>
                        </div>
                    </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Total insumos", valor: insumos.length, color: "#fff" },
                        { label: "Disponibles", valor: insumos.filter(i => i.stock >= i.minimo).length, color: C.emerald },
                        { label: "Stock bajo", valor: insumos.filter(i => i.stock > 0 && i.stock < i.minimo).length, color: C.amber },
                        { label: "Agotados", valor: insumos.filter(i => i.stock === 0).length, color: C.red },
                    ].map(k => (
                        <div key={k.label} className="rounded-xl px-4 py-3"
                            style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <p className="text-xs mb-1" style={{ color: C.slate }}>{k.label}</p>
                            <p className="text-2xl font-black font-mono" style={{ color: k.color }}>{k.valor}</p>
                        </div>
                    ))}
                </div>

                {/* Filtros */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.slate }} />
                        <input value={busqueda} onChange={e => setBusq(e.target.value)}
                            placeholder="Buscar insumo..."
                            className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white focus:outline-none"
                            style={{ background: C.surface, border: `1px solid ${C.border}` }} />
                    </div>
                    <div className="flex gap-2">
                        {(["todos", "bajo", "agotado"] as const).map(f => (
                            <button key={f} onClick={() => setFiltro(f)}
                                className="h-10 px-4 rounded-xl text-xs font-semibold transition-all"
                                style={{
                                    background: filtro === f ? `${C.orange}18` : C.surface,
                                    color: filtro === f ? C.orange : "#94a3b8",
                                    border: `1px solid ${filtro === f ? C.orange : C.border}`,
                                }}>
                                {f === "todos" ? "Todos" : f === "bajo" ? "Stock bajo" : "Agotados"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: C.surface }}>
                                {["Insumo", "Tipo", "Stock actual", "Mínimo", "Nivel", "Proveedor", "Vinculado a"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: C.slate }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((ins, i) => {
                                const st = stockStatus(ins.stock, ins.minimo);
                                const pct = Math.min(Math.round((ins.stock / Math.max(ins.minimo * 2, 1)) * 100), 100);
                                return (
                                    <tr key={ins.id} className="border-t"
                                        style={{ borderColor: C.border, background: i % 2 === 0 ? C.bg : `${C.surface}80` }}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 shrink-0" style={{ color: C.slate }} />
                                                <span className="text-sm font-semibold text-white">{ins.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded-full"
                                                style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                                                {ins.tipo} · {ins.subtipo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: st.color }} />
                                                </div>
                                                <span className="text-sm font-bold font-mono" style={{ color: st.color }}>
                                                    {ins.stock} {ins.unidad}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs" style={{ color: C.slate }}>
                                            {ins.minimo} {ins.unidad}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                                                style={{ background: st.bg, color: st.color }}>
                                                {ins.stock === 0 && <TrendingDown className="w-3 h-3" />}
                                                {ins.stock < ins.minimo && ins.stock > 0 && <AlertTriangle className="w-3 h-3" />}
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>{ins.proveedor}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {ins.vinculadoA.length === 0
                                                    ? <span className="text-xs" style={{ color: "#334155" }}>—</span>
                                                    : ins.vinculadoA.map(v => (
                                                        <span key={v} className="text-xs font-mono px-2 py-0.5 rounded-full"
                                                            style={{ background: `${C.orange}15`, color: C.orange }}>{v.slice(-4)}</span>
                                                    ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}