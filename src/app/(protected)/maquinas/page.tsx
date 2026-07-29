"use client";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { ModalGestionMaquina } from "./componentes/ModalGestionMaquina";
import { useEffect, useState } from "react";
import { Maquina } from "@/types";
import { Settings } from "lucide-react";
import { StatusBadge } from "./componentes/StatusBadge.";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";


export default function MaquinasPage() {
    const { maquinas } = useMaquinasStore();
    const { fetchMaquinas } = useMaquinasActions()
    const [selectedMaquina, setSelectedMaquina] = useState<Maquina | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMaquinas();
    }, [fetchMaquinas]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 text-white max-h-screen custom-scrollbar" style={{ background: AppColors.bg }}>
            {/* Header de página */}
            <Header title="Maquinaria y Equipos" subtitle="Gestión de activos y estado operativo" buttonLabel="Nueva máquina" onButtonClick={() => { setSelectedMaquina(null); setIsModalOpen(true) }} />

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard label="Total Equipos" valor={maquinas.length} />
                <StatCard label="Operativas" valor={maquinas.filter(m => m.estado === 'operativa').length} labelColor={AppColors.emerald} />
                <StatCard label="Bajo Revisión" valor={maquinas.filter(m => m.estado === 'bajo_revision').length} labelColor="#fbbf24" />
                <StatCard label="En Mantenimiento" valor={maquinas.filter(m => m.estado === 'mantenimiento').length} labelColor={AppColors.amber} />
                <StatCard label="Fuera de Servicio" valor={maquinas.filter(m => m.estado === 'fuera_servicio').length} labelColor={AppColors.red} />
            </div>

            {/* Tabla Estilo Insumos */}
            <div className="rounded-2xl border overflow-auto max-h-[550px] custom-scrollbar" style={{ background: AppColors.surface, borderColor: AppColors.border }}>
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10" style={{ background: AppColors.surface }}>
                        <tr className="border-b" style={{ borderColor: AppColors.border }}>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase" style={{ background: AppColors.surface }}>ID / Nombre</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase" style={{ background: AppColors.surface }}>Modelo</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase" style={{ background: AppColors.surface }}>Estado</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase" style={{ background: AppColors.surface }}>En Uso</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase" style={{ background: AppColors.surface }}>Último Mantenimiento</th>
                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase text-right" style={{ background: AppColors.surface }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maquinas.map((m) => (
                            <tr key={m.id} className="hover:bg-white/[0.02] border-b border-[#1e2130] transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-orange-500 font-bold">{m.codigo}</span>
                                        <span className="font-semibold text-sm">{m.nombre}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-300">{m.modelo}</td>
                                <td className="p-4">
                                    <StatusBadge status={m.estado} />
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${m.operarioAsignado ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                        {m.operarioAsignado ? 'Sí' : 'No'}
                                    </span>
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
