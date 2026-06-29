"use client";
import { useState, useEffect } from "react";
import { X, Hash, CheckCircle2, AlertCircle, Plus, ClipboardList, PenTool } from "lucide-react";
import { Operario } from "@/types";
import { AppColors } from "@/shared/constants";
import { useOrdenStore, useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";

const TAREAS_COMUNES = [
    "Cortes correspondientes",
    "Confección general",
    "Sobrehilado (overlook)",
    "Estampado",
    "Acabado / Costura fina",
    "Planchado",
    "Empaque y etiqueta"
];

interface Props {
    operario: Operario;
    onClose: () => void;
    onConfirm: (ordenId: string, tarea: string, piezasRequeridas: number, notas?: string) => void;
}

export function ModalAsignacionTarea({ operario, onClose, onConfirm }: Props) {
    const { ordenes, isLoading } = useOrdenStore();
    const { fetchOrdenes } = useOrdenActions();

    const [selectedOrd, setSelectedOrd] = useState("");
    const [selectedTareaPreset, setSelectedTareaPreset] = useState(TAREAS_COMUNES[0]);
    const [customTarea, setCustomTarea] = useState("");
    const [isCustomTarea, setIsCustomTarea] = useState(false);
    const [piezasRequeridas, setPiezasRequeridas] = useState<number>(0);
    const [notas, setNotas] = useState("");

    // Cargar órdenes en el montaje
    useEffect(() => {
        fetchOrdenes();
    }, [fetchOrdenes]);

    // Filtrar órdenes que no estén completadas o canceladas
    const ordenesActivas = ordenes.filter(o => o.estado !== "completada" && o.estado !== "cancelada");

    // Cuando se selecciona una orden, autocalcular la cantidad total sugerida
    useEffect(() => {
        if (selectedOrd) {
            const ordenSel = ordenes.find(o => o.id === selectedOrd);
            if (ordenSel) {
                const totalPiezas = ordenSel.lineas.reduce((acc, l) => acc + l.cantidad, 0);
                setPiezasRequeridas(totalPiezas);
            }
        } else {
            setPiezasRequeridas(0);
        }
    }, [selectedOrd, ordenes]);

    const handleConfirmar = () => {
        if (!selectedOrd) return;
        const tareaFinal = isCustomTarea ? customTarea.trim() : selectedTareaPreset;
        if (!tareaFinal) return;
        
        onConfirm(selectedOrd, tareaFinal, piezasRequeridas, notas);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md flex flex-col rounded-3xl shadow-2xl overflow-hidden border"
                style={{ background: AppColors.surface, borderColor: AppColors.border }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: AppColors.border }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 font-black">
                            {operario.nombre[0]}{operario.apellido[0]}
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base">Asignar Orden y Tarea</h2>
                            <p className="text-[11px] text-slate-500">{operario.nombre} {operario.apellido}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">

                    {/* Selección de Orden */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-orange-500" /> Orden de Producción Activa
                        </label>
                        <div className="relative">
                            <select
                                value={selectedOrd}
                                onChange={(e) => setSelectedOrd(e.target.value)}
                                className="w-full h-12 pl-4 pr-10 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 appearance-none font-medium"
                            >
                                <option value="">Seleccionar una orden activa...</option>
                                {ordenesActivas.map(ord => {
                                    const totalPiezas = ord.lineas.reduce((acc, l) => acc + l.cantidad, 0);
                                    return (
                                        <option key={ord.id} value={ord.id}>
                                            {ord.numero} — {ord.cliente} ({totalPiezas} uds.)
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Plus className="w-4 h-4 text-slate-500 rotate-45" />
                            </div>
                        </div>
                        {isLoading && <p className="text-[10px] text-slate-500 animate-pulse">Cargando órdenes...</p>}
                    </div>

                    {/* Tarea Asignada */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <PenTool className="w-3.5 h-3.5 text-orange-500" /> Tarea a Realizar
                        </label>
                        
                        <div className="flex gap-4 mb-2">
                            <button
                                type="button"
                                onClick={() => setIsCustomTarea(false)}
                                className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all border ${!isCustomTarea ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-transparent border-[#1e2130] text-slate-400'}`}
                            >
                                Operación Común
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCustomTarea(true)}
                                className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all border ${isCustomTarea ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-transparent border-[#1e2130] text-slate-400'}`}
                            >
                                Personalizada
                            </button>
                        </div>

                        {!isCustomTarea ? (
                            <div className="relative">
                                <select
                                    value={selectedTareaPreset}
                                    onChange={(e) => setSelectedTareaPreset(e.target.value)}
                                    className="w-full h-12 pl-4 pr-10 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 appearance-none font-medium"
                                >
                                    {TAREAS_COMUNES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Plus className="w-4 h-4 text-slate-500 rotate-45" />
                                </div>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={customTarea}
                                onChange={(e) => setCustomTarea(e.target.value)}
                                placeholder="Ej: Sobrehilado de cuellos y mangas..."
                                className="w-full h-12 px-4 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                            />
                        )}
                    </div>

                    {/* Piezas Requeridas */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <ClipboardList className="w-3.5 h-3.5 text-orange-500" /> Cantidad de Piezas Asignadas
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={piezasRequeridas || ""}
                            onChange={(e) => setPiezasRequeridas(Number(e.target.value))}
                            placeholder="Ej: 50"
                            className="w-full h-12 px-4 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                        />
                        <p className="text-[9px] text-slate-500">Puedes dividir la cantidad total de la orden entre varios operarios si es necesario.</p>
                    </div>

                    {/* Notas adicionales */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Notas / Instrucciones especiales</label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            rows={2}
                            placeholder="Instrucciones adicionales para el operario..."
                            className="w-full px-4 py-3 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all resize-none font-medium"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-black/20 border-t border-[#1e2130]">
                    <button
                        onClick={handleConfirmar}
                        disabled={!selectedOrd || (isCustomTarea && !customTarea.trim()) || piezasRequeridas <= 0}
                        className="w-full h-12 rounded-2xl text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                        style={{ background: AppColors.orange }}
                    >
                        Confirmar Asignación
                    </button>
                </div>
            </div>
        </div>
    );
}