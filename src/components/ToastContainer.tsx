"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Toast {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: "info" | "warning" | "error" | "success";
}

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
    const duration = toast.tipo === "error" ? 8000 : 6000;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, duration);
        return () => clearTimeout(timer);
    }, [toast.id, onClose, duration]);

    let accentColor = "border-blue-500";
    let iconBg = "bg-blue-500";
    if (toast.tipo === "warning") {
        accentColor = "border-amber-500";
        iconBg = "bg-amber-500";
    } else if (toast.tipo === "error") {
        accentColor = "border-red-500";
        iconBg = "bg-red-500";
    } else if (toast.tipo === "success") {
        accentColor = "border-emerald-500";
        iconBg = "bg-emerald-500";
    }

    return (
        <div
            className={`pointer-events-auto relative overflow-hidden bg-[#13161e]/95 backdrop-blur-md border-l-4 ${accentColor} text-white p-4.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex gap-3.5 border border-white/5 transition-all duration-300 hover:scale-[1.02]`}
        >
            <div className="flex-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${iconBg} animate-ping`} />
                    {toast.titulo}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium leading-relaxed">{toast.mensaje}</p>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="text-slate-500 hover:text-white transition-colors h-fit p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Barra de progreso visual con decremento */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
                <div 
                    className={`h-full ${iconBg} animate-toast-progress`} 
                    style={{ animationDuration: `${duration}ms` }}
                />
            </div>
        </div>
    );
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onClose={onClose} />
            ))}
        </div>
    );
}

