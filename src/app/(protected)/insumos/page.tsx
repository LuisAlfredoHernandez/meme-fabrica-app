"use client";
// ─────────────────────────────────────────────────────────────
// app/insumos/page.tsx — Gestión Unificada de Inventario
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { AlertTriangle, Search, Package, TrendingDown } from "lucide-react";
import { ModalGestionInsumo } from "./components/ModalGestionInsumo"; // Asegúrate de que el nombre coincida
import { normalizeText } from "@/utils/formatters";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";


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
        <div className="min-h-screen p-8 text-white">
            {modalConfig.open && (
                <ModalGestionInsumo
                    // initialId={modalConfig.id} 
                    // initialMode={modalConfig.mode}
                    onClose={() => setModalConfig({ open: false })}
                />
            )}

            {/* Header pantalla*/}
            <Header title="Inventario" subtitle="RF6 — Gestión Unificada de Inventario" buttonLabel="Movimiento de stock" onButtonClick={abrirGestion} />

            <div className="p-6 space-y-6">
                {/* KPIs Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Items", val: insumos.length, color: "#fff" },
                        { label: "Stock Bajo", val: insumos.filter(i => i.stock < i.minimo && i.stock > 0).length, color: AppColors.amber },
                        { label: "Agotados", val: insumos.filter(i => i.stock === 0).length, color: AppColors.red },
                        { label: "Salud de Inv.", val: "88%", color: AppColors.emerald },
                    ].map((k, idx) => (
                        <StatCard key={idx} label={k.label} valor={k.val} labelColor={k.color} />
                    ))}
                </div>

                {/* Filtros y Búsqueda */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#13161e] p-2 rounded-2xl border" style={{ borderColor: AppColors.border }}>
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
                <div className="rounded-2xl border overflow-hidden bg-[#13161e]" style={{ borderColor: AppColors.border }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: AppColors.border, background: "#1a1f2e" }}>
                                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Insumo / Código</th>
                                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Estado</th>
                                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Existencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((ins) => (
                                <tr key={ins.id} className="hover:bg-white/[0.02] border-b border-[#1e2130] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <Package className="w-4 h-4 shrink-0 " style={{ color: AppColors.slate }} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded"
                                                        style={{ background: `${AppColors.orange}18`, color: AppColors.orange }}>{ins.codigo}</span>
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