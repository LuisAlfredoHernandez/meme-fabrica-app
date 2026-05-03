"use client";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { ModalGestionMaquina } from "./componentes/ModalGestionMaquina";
import { useEffect, useState } from "react";
import { Maquina } from "@/types";
import { Plus, Settings, } from "lucide-react";
import { StatusBadge } from "./componentes/StatusBadge.";
import { MetricCard } from "./componentes/MetricCard";
import { AppColors } from "@/shared/constants";


export default function MaquinasPage() {
    const { maquinas } = useMaquinasStore();
    const { fetchMaquinas } = useMaquinasActions()
    const [selectedMaquina, setSelectedMaquina] = useState<Maquina | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMaquinas();
    }, [fetchMaquinas]);

    return (
        <div className="min-h-screen p-8 text-white" style={{ background: AppColors.bg }}>
            {/* Header de Pantalla */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Maquinaria y Equipos</h1>
                    <p className="text-sm text-slate-500">Gestión de activos y estado operativo</p>
                </div>
                <button
                    onClick={() => { setSelectedMaquina(null); setIsModalOpen(true); }}
                    className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20"
                    style={{ background: AppColors.orange }}
                >
                    <Plus className="w-5 h-5" /> Nueva máquina
                </button>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <MetricCard title="Total Equipos" value={maquinas.length} />
                <MetricCard title="Activas" value={maquinas.filter(m => m.estado === 'activa').length} color={AppColors.emerald} />
                <MetricCard title="En Mantenimiento" value={maquinas.filter(m => m.estado === 'inactiva').length} color={AppColors.amber} />
                <MetricCard title="Depreciadas" value={maquinas.filter(m => m.estado === 'depreciada').length} color={AppColors.red} />
            </div>

            {/* Tabla Estilo Insumos */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: AppColors.surface, borderColor: AppColors.border }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b" style={{ borderColor: AppColors.border }}>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">ID / Nombre</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Modelo</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Estado</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Último Mantenimiento</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maquinas.map((m) => (
                            <tr key={m.id} className="hover:bg-white/[0.02] border-b border-[#1e2130] transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-orange-500 font-bold">{m.id}</span>
                                        <span className="font-semibold text-sm">{m.nombre}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-300">{m.modelo}</td>
                                <td className="p-4">
                                    <StatusBadge status={m.estado} />
                                </td>
                                <td className="p-4 text-sm text-slate-500">12 Abr 2026</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => { setSelectedMaquina(m); setIsModalOpen(true); }}
                                        className="p-2 hover:bg-orange-500/10 rounded-lg group transition-all"
                                    >
                                        <Settings className="w-4 h-4 text-slate-500 group-hover:text-orange-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ModalGestionMaquina
                    maquina={selectedMaquina ?? undefined}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
