"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Trash2, Check, Clock, Info, AlertTriangle, CheckCircle, Factory, Shield } from "lucide-react";
import { useNotifications, useNotificationActions } from "@/shared/store/useNotificationStore";

const C = {
    surface: "#13161e",
    border: "#1e2130",
    orange: "#f97316",
    slate: "#475569",
    bg: "#080b10"
};

export function NotificationBell({ isSidebarExpanded = false }: { isSidebarExpanded?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const notifications = useNotifications();
    const { markAsRead, markAllAsRead, clearAll, setSelectedNotification } = useNotificationActions();
    const popoverRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.leido).length;

    // Cerrar el popover al hacer clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return "Ahora";
            if (diffMins < 60) return `Hace ${diffMins} min`;
            
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `Hace ${diffHours} h`;
            
            return date.toLocaleDateString("es-DO", { day: "2-digit", month: "short" }) + 
                   " " + 
                   date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
        } catch (e) {
            return "";
        }
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case "success":
                return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case "error":
                return <AlertTriangle className="w-4 h-4 text-red-400" />;
            case "warning":
                return <Shield className="w-4 h-4 text-amber-400" />;
            default:
                return <Info className="w-4 h-4 text-sky-400" />;
        }
    };

    const getBorderColor = (tipo: string) => {
        switch (tipo) {
            case "success": return "border-emerald-500/30";
            case "error": return "border-red-500/30";
            case "warning": return "border-amber-500/30";
            default: return "border-sky-500/30";
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Botón de la Campana */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 relative cursor-pointer hover:bg-[#818cf815] ${
                    isOpen ? "bg-[#818cf815]" : ""
                }`}
                style={{ color: unreadCount > 0 ? C.orange : "#64748b" }}
            >
                <div className="relative shrink-0 flex items-center justify-center">
                    <Bell className={`w-5 h-5 transition-transform duration-300 ${unreadCount > 0 ? "animate-swing" : ""}`} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 bg-red-500 text-[9px] font-black text-white flex items-center justify-center rounded-full border-2 border-[#13161e] leading-none animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </div>

                <div className={`flex-1 flex items-center justify-between min-w-0 transition-all duration-300 ${
                    isSidebarExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 pointer-events-none absolute"
                }`}>
                    <span className="text-xs font-bold text-slate-300 hover:text-white">
                        Notificaciones
                    </span>
                    {unreadCount > 0 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                            Nuevas
                        </span>
                    )}
                </div>
            </button>

            {/* Popover flotante de notificaciones */}
            {isOpen && (
                <div
                    className="absolute bottom-16 left-2 z-50 w-80 bg-[#13161e]/98 backdrop-blur-lg border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300"
                    style={{ borderColor: C.border }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-white">Notificaciones</h4>
                            {unreadCount > 0 && (
                                <span className="bg-orange-500/20 text-orange-400 font-extrabold px-1.5 py-0.5 text-[9px] rounded-md">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    title="Marcar todo como leído"
                                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => clearAll()}
                                    title="Limpiar historial"
                                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        markAsRead(n.id);
                                        setSelectedNotification(n);
                                    }}
                                    className={`p-3.5 transition-colors flex gap-3 relative cursor-pointer hover:bg-white/5 ${
                                        !n.leido ? "bg-[#818cf807]" : ""
                                    }`}
                                >
                                    {/* Indicador de no leído */}
                                    {!n.leido && (
                                        <span className="absolute top-4.5 left-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                    )}

                                    {/* Icono de tipo */}
                                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center border bg-white/5 ${getBorderColor(n.tipo)}`}>
                                        {getIcon(n.tipo)}
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-[11px] font-extrabold truncate ${!n.leido ? "text-white" : "text-slate-300"}`}>
                                                {n.titulo}
                                            </p>
                                            <span className="text-[9px] text-slate-500 shrink-0 flex items-center gap-1 font-bold">
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatTime(n.fecha)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed break-words">
                                            {n.mensaje}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 px-4 text-center text-slate-500 text-xs font-semibold italic">
                                No tienes notificaciones.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
