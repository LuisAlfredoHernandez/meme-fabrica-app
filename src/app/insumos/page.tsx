"use client";
// ─────────────────────────────────────────────────────────────
// app/insumos/page.tsx — RF6 · Gestión de insumos y materiales
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { Plus, AlertTriangle, Search, Package, X, TrendingDown } from "lucide-react";
import { ModalEntradaInsumo } from "./components/ModalNuevoInsumo";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
};

function stockStatus(stock: number, minimo: number) {
    if (stock === 0) return { color: C.red, label: "Agotado", bg: `${C.red}15` };
    if (stock < minimo) return { color: C.amber, label: "Stock bajo", bg: `${C.amber}15` };
    return { color: C.emerald, label: "Disponible", bg: `${C.emerald}15` };
}

export default function InsumosPage() {
    // Obtenemos el estado y las acciones de hooks separados para optimizar re-renders
    const { insumos, isLoading, error } = useInsumosStore();
    const { fetchInsumos } = useInsumosActions();

    const [busqueda, setBusq] = useState("");
    const [modal, setModal] = useState(false);
    const [filtro, setFiltro] = useState<"todos" | "bajo" | "agotado">("todos");

    useEffect(() => {
        fetchInsumos();
    }, [fetchInsumos]);

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
            {modal && <ModalEntradaInsumo onClose={() => setModal(false)} />}

            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border, background: C.surface }}>
                <div>
                    <h1 className="text-lg font-black text-white">Insumos y Materiales</h1>
                    <p className="text-xs mt-0.5" style={{ color: C.slate }}>RF6 — Inventario vinculado a órdenes</p>
                </div>
                <button onClick={() => setModal(true)}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold"
                    style={{ background: C.orange }}>
                    <Plus className="w-4 h-4" /> Entrada Inventario
                </button>
            </div>

            {isLoading && (
                <div className="p-10 text-center text-sm" style={{ color: C.slate }}>
                    Cargando inventario de insumos...
                </div>
            )}

            {error && (
                <div className="p-10 text-center text-sm" style={{ color: C.red }}>
                    <strong>Error al cargar los datos:</strong> {error}
                </div>
            )}

            {!isLoading && !error && (
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
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded"
                                                                style={{ background: `${C.orange}18`, color: C.orange }}>{ins.codigo}</span>
                                                            <span className="text-sm font-semibold text-white">{ins.nombre}</span>
                                                        </div>
                                                    </div>
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
                                                    {ins.vinculadoA?.length === 0
                                                        ? <span className="text-xs" style={{ color: "#334155" }}>—</span>
                                                        : ins.vinculadoA?.map(v => (
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
            )}
        </div>
    );
}