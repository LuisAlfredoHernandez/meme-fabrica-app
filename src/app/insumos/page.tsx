"use client";
// ─────────────────────────────────────────────────────────────
// app/insumos/page.tsx — Gestión Unificada de Inventario
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { Plus, AlertTriangle, Search, Package, TrendingDown } from "lucide-react";
import { ModalGestionInsumo } from "./components/ModalGestionInsumo"; // Asegúrate de que el nombre coincida
import { normalizeText } from "@/utils/formatters";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", slate: "#475569",
};

export default function InsumosPage() {
    const { insumos, isLoading, error } = useInsumosStore();
    const { fetchInsumos } = useInsumosActions();

    const [busqueda, setBusq] = useState("");
    const [filtro, setFiltro] = useState<"todos" | "bajo" | "agotado">("todos");

    // Control del Modal Único
    const [modalConfig, setModalConfig] = useState<{ open: boolean; id?: string; mode?: "entrada" | "salida" | "eliminar" }>({
        open: false
    });

    useEffect(() => {
        fetchInsumos();
    }, [fetchInsumos]);

    const filtrados = insumos.filter(i => {
        const matchBusq = normalizeText(i.nombre).includes(normalizeText(busqueda));
        const matchFilt = filtro === "todos" ||
            (filtro === "agotado" && i.stock === 0) ||
            (filtro === "bajo" && i.stock > 0 && i.stock < i.minimo);
        return matchBusq && matchFilt;
    });

    // Función para abrir el modal con una configuración específica
    const abrirGestion = (id?: string, mode: "entrada" | "salida" | "eliminar" = "entrada") => {
        setModalConfig({ open: true, id, mode });
    };

    return (
        <div className="flex-1 overflow-auto bg-[#080b10] text-slate-300">

            {modalConfig.open && (
                <ModalGestionInsumo
                    // Si pasas estos props al modal, puedes hacer que se inicialice en el modo correcto
                    // initialId={modalConfig.id} 
                    // initialMode={modalConfig.mode}
                    onClose={() => setModalConfig({ open: false })}
                />
            )}

            {/* Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border, background: C.surface }}>
                <div>
                    <h1 className="text-xl font-black text-white">Meme Fábricas: Inventario</h1>
                    <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Control de Insumos RF6</p>
                </div>
                <button
                    onClick={() => abrirGestion()}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold shadow-lg shadow-orange-500/10 hover:scale-105 active:scale-95 transition-all"
                    style={{ background: C.orange }}>
                    <Plus className="w-4 h-4" /> Movimiento de stock
                </button>
            </div>

            <div className="p-6 space-y-6">

                {/* KPIs Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Items", val: insumos.length, color: "#fff" },
                        { label: "Stock Bajo", val: insumos.filter(i => i.stock < i.minimo && i.stock > 0).length, color: C.amber },
                        { label: "Agotados", val: insumos.filter(i => i.stock === 0).length, color: C.red },
                        { label: "Salud de Inv.", val: "88%", color: C.emerald },
                    ].map(k => (
                        <div key={k.label} className="p-4 rounded-2xl border bg-[#13161e]/50" style={{ borderColor: C.border }}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{k.label}</p>
                            <p className="text-2xl font-black mt-1" style={{ color: k.color }}>{k.val}</p>
                        </div>
                    ))}
                </div>

                {/* Filtros y Búsqueda */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#13161e] p-2 rounded-2xl border" style={{ borderColor: C.border }}>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            value={busqueda}
                            onChange={e => setBusq(e.target.value)}
                            placeholder="Filtrar por nombre o código..."
                            className="w-full h-10 pl-10 pr-4 bg-[#0d1018] rounded-xl text-sm focus:outline-none border border-transparent focus:border-orange-500/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-[#0d1018] rounded-xl">
                        {(["todos", "bajo", "agotado"] as const).map(f => (
                            <button key={f} onClick={() => setFiltro(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filtro === f ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabla de Insumos */}
                <div className="rounded-2xl border overflow-hidden bg-[#13161e]" style={{ borderColor: C.border }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: C.border, background: "#1a1f2e" }}>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Insumo / Código</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Existencia</th>
                                {/* <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">Acciones</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((ins) => (
                                <tr key={ins.id} className="border-t-[0.5px] hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <Package className="w-4 h-4 shrink-0 " style={{ color: C.slate }} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded"
                                                        style={{ background: `${C.orange}18`, color: C.orange }}>{ins.codigo}</span>
                                                    <span className="text-sm font-semibold text-white">{ins.nombre}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {ins.stock === 0 ? (
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full w-fit">
                                                <TrendingDown className="w-3 h-3" /> AGOTADO
                                            </span>
                                        ) : ins.stock < ins.minimo ? (
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full w-fit">
                                                <AlertTriangle className="w-3 h-3" /> STOCK BAJO
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full w-fit">
                                                ÓPTIMO
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-white">{ins.stock} <span className="text-[10px] text-slate-500 font-normal">{ins.unidad}</span></span>
                                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-500" style={{ width: `${Math.min((ins.stock / (ins.minimo * 2)) * 100, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}