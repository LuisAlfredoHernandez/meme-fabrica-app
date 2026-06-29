"use client";

import { useEffect, useRef } from "react";
import { X, Clock, CheckCircle2, AlertTriangle, AlertCircle, Info, Factory, ClipboardList, Settings, Archive } from "lucide-react";
import { NotificationItem } from "@/shared/store/useNotificationStore";

const C = {
    surface: "#13161e",
    border: "#1e2130",
    orange: "#f97316",
    bg: "#080b10"
};

export function NotificationDetailModal({
    notification,
    onClose
}: {
    notification: NotificationItem;
    onClose: () => void;
}) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Cerrar con la tecla Escape o al hacer clic fuera
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case "success":
                return <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-50 duration-300" />;
            case "error":
                return <AlertCircle className="w-8 h-8 text-red-400 animate-in zoom-in-50 duration-300" />;
            case "warning":
                return <AlertTriangle className="w-8 h-8 text-amber-400 animate-in zoom-in-50 duration-300" />;
            default:
                return <Info className="w-8 h-8 text-sky-400 animate-in zoom-in-50 duration-300" />;
        }
    };

    const getBadgeStyle = (tipo: string) => {
        switch (tipo) {
            case "success":
                return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            case "error":
                return "bg-red-500/10 text-red-400 border border-red-500/20";
            case "warning":
                return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            default:
                return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
        }
    };

    const formatFullDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString("es-DO", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        } catch (e) {
            return isoString;
        }
    };

    const d = notification.detalles;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="w-full max-w-md bg-[#13161e] border rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col animate-in zoom-in-95 duration-300"
                style={{ borderColor: C.border }}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-3">
                        {getIcon(notification.tipo)}
                        <div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getBadgeStyle(notification.tipo)}`}>
                                {notification.tipo}
                            </span>
                            <h3 className="text-base font-black text-white mt-1 leading-snug">
                                {notification.titulo}
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {/* Mensaje principal */}
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">
                        {notification.mensaje}
                    </p>

                    {/* Contenido Extra de Detalles de Validación (Certificación) */}
                    {d && (d.piezas_reportadas !== undefined || d.piezas_buenas !== undefined || d.piezas_defectuosas !== undefined) && (
                        <div className="bg-[#080b10] border rounded-2xl p-4 space-y-4" style={{ borderColor: C.border }}>
                            <div className="flex items-center gap-2 mb-1">
                                <ClipboardList className="w-4 h-4 text-orange-500" />
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Desglose de Producción</h4>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Reportadas</p>
                                    <p className="text-lg font-black text-orange-400">{d.piezas_reportadas ?? 0}</p>
                                </div>
                                <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                    <p className="text-[10px] text-emerald-500/75 font-bold uppercase tracking-wider mb-1">Buenas</p>
                                    <p className="text-lg font-black text-emerald-400">{d.piezas_buenas ?? 0}</p>
                                </div>
                                <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10">
                                    <p className="text-[10px] text-red-500/75 font-bold uppercase tracking-wider mb-1">Defectos</p>
                                    <p className="text-lg font-black text-red-400">{d.piezas_defectuosas ?? 0}</p>
                                </div>
                            </div>
                            
                            {d.piezas_reportadas !== undefined && d.piezas_buenas !== undefined && (
                                <div className="text-center pt-2">
                                    <p className="text-xs text-slate-400 font-medium">
                                        Se aprobaron <span className="text-emerald-400 font-extrabold">{d.piezas_buenas}</span> de <span className="text-white font-extrabold">{d.piezas_reportadas}</span> unidades propuestas.
                                    </p>
                                </div>
                            )}

                            {d.orden_numero && (
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                                    <span className="font-semibold">Orden de Trabajo:</span>
                                    <span className="font-mono font-bold text-[#818cf8]">{d.orden_numero}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contenido Extra de Falla de Máquina */}
                    {d && d.maquina_codigo && (
                        <div className="bg-[#080b10] border rounded-2xl p-4 space-y-3" style={{ borderColor: C.border }}>
                            <div className="flex items-center gap-2">
                                <Factory className="w-4 h-4 text-red-500" />
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Detalles de Maquinaria</h4>
                            </div>

                            <div className="divide-y divide-white/5 text-xs">
                                <div className="py-2 flex justify-between">
                                    <span className="text-slate-400 font-semibold">Tipo:</span>
                                    <span className="text-white font-bold capitalize">{d.maquina_tipo || "Desconocido"}</span>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <span className="text-slate-400 font-semibold">Código Identificador:</span>
                                    <span className="text-orange-400 font-mono font-bold">{d.maquina_codigo}</span>
                                </div>
                                {d.motivo && (
                                    <div className="py-3.5 space-y-1">
                                        <p className="text-slate-400 font-semibold flex items-center gap-1.5">
                                            <Settings className="w-3.5 h-3.5 text-slate-500 animate-spin" /> Falla reportada:
                                        </p>
                                        <p className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-slate-300 font-medium leading-relaxed italic text-[11px] break-words">
                                            "{d.motivo}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contenido Extra de Asignación / Acción de Tarea */}
                    {d && d.action && (
                        <div className="flex items-center gap-2 bg-[#080b10] border rounded-xl p-3" style={{ borderColor: C.border }}>
                            <Archive className="w-4 h-4 text-sky-400" />
                            <span className="text-xs text-slate-400">
                                Tipo de Operación: <span className="font-bold text-white capitalize">{d.action === "created" ? "asignación" : d.action === "deleted" ? "remoción" : "modificación"} de tarea</span>.
                            </span>
                        </div>
                    )}

                    {/* Fecha de Emisión */}
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold border-t pt-4" style={{ borderColor: C.border }}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Emitida el {formatFullDate(notification.fecha)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#0d1018] border-t flex justify-end" style={{ borderColor: C.border }}>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/5"
                    >
                        Cerrar Detalles
                    </button>
                </div>
            </div>
        </div>
    );
}
