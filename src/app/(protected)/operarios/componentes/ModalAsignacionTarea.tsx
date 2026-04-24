"use client";
import { useState } from "react";
import { X, Cpu, Hash, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { Operario, TipoMaquina } from "@/types";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", slate: "#475569",
    inputBg: "#0d1018"
};

// Configuración de máquinas (metadatos visuales)
const MAQUINAS_CFG: Record<string, { label: string; color: string }> = {
    merrow: { label: "Merrow", color: "#f97316" },
    cover: { label: "Cover", color: "#818cf8" },
    plana: { label: "Plana", color: "#38bdf8" },
    corte: { label: "Corte", color: "#fbbf24" },
    plancha_dtf: { label: "Plancha DTF", color: "#f472b6" },
    peso: { label: "Peso/Escala", color: "#34d399" },
};

// Mock de órdenes disponibles (Esto vendría de tu OrderStore)
const ORDENES_DISPONIBLES = [
    { id: "ORD-2026-0042", cliente: "Boutique Bella", prioridad: "Alta" },
    { id: "ORD-2026-0043", cliente: "ModaRD Store", prioridad: "Media" },
    { id: "ORD-2026-0044", cliente: "Stock Interno", prioridad: "Baja" },
];

interface Props {
    operario: Operario;
    onClose: () => void;
    onConfirm: (maquina: string, orden: string) => void;
}

export function ModalAsignacionTarea({ operario, onClose, onConfirm }: Props) {
    const [selectedMaq, setSelectedMaq] = useState(operario.maquinaActual || "");
    const [selectedOrd, setSelectedOrd] = useState(operario.ordenActual || "");

    // CONSTRAINT: Solo máquinas que el operario tenga en sus habilidades
    const maquinasHabilitadas = Object.entries(MAQUINAS_CFG).filter(([key]) =>
        operario.habilidades.some(h => h.maquina === key)
    );

    const handleConfirmar = () => {
        if (!selectedMaq || !selectedOrd) return;
        onConfirm(selectedMaq, selectedOrd);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md flex flex-col rounded-3xl shadow-2xl overflow-hidden border"
                style={{ background: C.surface, borderColor: C.border }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 font-black">
                            {operario.nombre[0]}{operario.apellido[0]}
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base">Asignar Estación</h2>
                            <p className="text-[11px] text-slate-500">{operario.nombre} {operario.apellido}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Sección 1: Selección de Máquina (Solo habilidades) */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Cpu className="w-3 h-3" /> Estaciones Certificadas
                        </label>

                        {maquinasHabilitadas.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {maquinasHabilitadas.map(([key, cfg]) => {
                                    const isSelected = selectedMaq.toLowerCase().includes(key);
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedMaq(`${key.toUpperCase()}-01`)} // Simulación de ID de estación
                                            className="flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left"
                                            style={{
                                                borderColor: isSelected ? cfg.color : C.border,
                                                background: isSelected ? `${cfg.color}15` : C.inputBg
                                            }}
                                        >
                                            <div className="min-w-0">
                                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                    {cfg.label}
                                                </p>
                                                <p className="text-[9px] text-slate-500 font-mono">EST-01</p>
                                            </div>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: cfg.color }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <p className="text-[11px] text-red-200/70">Este operario no tiene máquinas certificadas en su perfil.</p>
                            </div>
                        )}
                    </div>

                    {/* Sección 2: Selección de Orden */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Hash className="w-3 h-3" /> Orden de Producción
                        </label>
                        <div className="relative">
                            <select
                                value={selectedOrd}
                                onChange={(e) => setSelectedOrd(e.target.value)}
                                className="w-full h-12 pl-4 pr-10 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 appearance-none"
                            >
                                <option value="">Seleccionar una orden...</option>
                                {ORDENES_DISPONIBLES.map(ord => (
                                    <option key={ord.id} value={ord.id}>
                                        {ord.id} — {ord.cliente}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Plus className="w-4 h-4 text-slate-500 rotate-45" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-black/20 border-t border-[#1e2130]">
                    <button
                        onClick={handleConfirmar}
                        disabled={!selectedMaq || !selectedOrd}
                        className="w-full h-12 rounded-2xl text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                        style={{ background: C.orange }}
                    >
                        Confirmar Asignación
                    </button>
                </div>
            </div>
        </div>
    );
}