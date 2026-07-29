"use client";
// ─────────────────────────────────────────────────────────────
// app/(protected)/layout.tsx — Layout con Sidebar para rutas protegidas
// ─────────────────────────────────────────────────────────────
// Usa este layout en: dashboard, ordenes, registro, operarios, insumos, ia
// La ruta /login usa su propio layout sin sidebar

import { Sidebar, NAV, ROL_COLOR } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { useAsignacionStore, useAsignacionActions } from "@/features/operarios/store/useAsignacionStore";
import { useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useValidacionStore, useValidacionActions } from "@/features/validacion/store/useValidacionStore";
import { ToastContainer } from "@/components/ToastContainer";
import { useToasts, useSelectedNotification, useNotificationActions } from "@/shared/store/useNotificationStore";
import { NotificationDetailModal } from "@/components/layout/NotificationDetailModal";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const { fetchAsignaciones } = useAsignacionActions();
    const { asignaciones } = useAsignacionStore();
    const { fetchOrdenes } = useOrdenActions();
    const { fetchMaquinas, fetchReportesAveriaPendientes } = useMaquinasActions();
    const { fetchOperarios } = useOperarioActions();
    const { fetchPendientes } = useValidacionActions();
    const { pendientes } = useValidacionStore();
    const [isWsConnected, setIsWsConnected] = useState(false);
    const toasts = useToasts();
    const selectedNotification = useSelectedNotification();
    const { addNotification, addToastOnly, removeToast, setSelectedNotification, syncPendingValidations, syncOperatorAssignments, syncUser } = useNotificationActions();

    // Sincronizar el usuario actual para evitar mezcla de notificaciones entre cuentas y prevenir reaparición
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            syncUser(user.id);
        }
    }, [isAuthenticated, user, syncUser]);

    // Sincronizar reportes de avance pendientes con el historial de notificaciones del supervisor/admin
    useEffect(() => {
        if (!isAuthenticated || !user || user.rol === "operario") return;

        const mappedPendientes = pendientes.map((p) => ({
            id: p.id,
            operarioNombre: p.operarioNombre,
            fechaReporte: p.fechaReporte,
            piezasReportadas: p.piezasReportadas,
        }));

        syncPendingValidations(mappedPendientes);
    }, [pendientes, isAuthenticated, user, syncPendingValidations]);

    // Sincronizar tareas asignadas con el historial de notificaciones del operario
    useEffect(() => {
        if (!isAuthenticated || !user || user.rol !== "operario") return;

        const myAssignments = asignaciones.filter((a) => a.operario_id === user.id);
        const mappedAssignments = myAssignments.map((a) => ({
            id: a.id,
            ordenNumero: a.orden?.numero || "ORD-N/A",
            fechaAsignacion: a.fecha_asignacion,
        }));

        syncOperatorAssignments(mappedAssignments);
    }, [asignaciones, isAuthenticated, user, syncOperatorAssignments]);

    // Conexión global WebSocket con fallback a Polling en caso de error/bloqueo de red
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
        const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
        
        let wsHost = "";
        try {
            const urlObj = new URL(apiUrl);
            wsHost = urlObj.host;
            if (typeof window !== "undefined") {
                const currentHost = window.location.hostname;
                if (currentHost === "localhost" || currentHost === "127.0.0.1") {
                    wsHost = `${currentHost}:${urlObj.port || (wsProtocol === "wss:" ? "443" : "80")}`;
                }
            }
        } catch (e) {
            wsHost = apiUrl.replace(/^https?:\/\//, "");
        }
        
        const wsUrl = `${wsProtocol}//${wsHost}/ws/updates`;
        console.log("[Global WS] Intentando conectar en:", wsUrl);

        let socket: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log("[Global WS] Conectado con éxito.");
                setIsWsConnected(true);
            };

            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log("[Global WS] Evento de actualización recibido:", message);
                    
                    const isCurrentUser = message.usuario_id === user.id;

                    if (
                        message.event === "order_created" ||
                        message.event === "order_updated" ||
                        message.event === "order_deleted"
                    ) {
                        fetchOrdenes();
                        if (message.event === "order_created") {
                            if (!isCurrentUser && user.rol !== "operario") {
                                addNotification("Nueva Orden", `Se ha creado la orden de trabajo ${message.numero || ""} en el sistema.`, "info");
                            }
                        } else if (message.event === "order_updated") {
                            if (!isCurrentUser && user.rol !== "operario") {
                                addNotification("Orden Actualizada", `Se ha modificado la orden de trabajo ${message.numero || ""}.`, "info");
                            }
                        } else if (message.event === "order_deleted") {
                            if (!isCurrentUser && user.rol !== "operario") {
                                addNotification("Orden Eliminada", "Se ha cancelado o eliminado una orden de trabajo.", "warning");
                            }
                        }
                    }
                    
                    if (
                        message.event === "assignment_updated" ||
                        message.event === "reporte_avance_created" ||
                        message.event === "reporte_avance_validated"
                    ) {
                        fetchAsignaciones();
                        if (user.rol !== "operario") {
                            fetchPendientes();
                        }
                        if (message.event === "assignment_updated") {
                            if (isCurrentUser) {
                                const actionText = message.action === "created" ? "creada" : message.action === "deleted" ? "eliminada" : "modificada";
                                addToastOnly("Asignación de Tareas", `Has registrado la asignación ${actionText} con éxito.`, "success");
                            } else {
                                const isTargetOperator = message.operario_id === user.id;
                                if (isTargetOperator) {
                                    if (message.action === "created") {
                                        addNotification(
                                            "Nueva Tarea Asignada", 
                                            "El supervisor te ha asignado una nueva tarea de producción.", 
                                            "warning",
                                            { action: message.action }
                                        );
                                    } else if (message.action === "deleted") {
                                        addNotification(
                                            "Tarea Removida", 
                                            "El supervisor ha retirado una tarea de tu lista de producción.", 
                                            "error",
                                            { action: message.action }
                                        );
                                    } else {
                                        addNotification(
                                            "Tarea Actualizada", 
                                            "Se han modificado los detalles de tu tarea asignada.", 
                                            "info",
                                            { action: message.action }
                                        );
                                    }
                                } else if (user.rol !== "operario") {
                                    const actionText = message.action === "created" ? "creado un nuevo encargo" : message.action === "deleted" ? "retirado un encargo" : "actualizado las tareas";
                                    addNotification("Asignación de Tareas", `Otro supervisor ha ${actionText} en la planta.`, "info", { action: message.action });
                                }
                            }
                        } else if (message.event === "reporte_avance_created") {
                            if (!isCurrentUser && user.rol !== "operario") {
                                addNotification("Revisión Pendiente", "Un operario ha reportado avance de producción. Pendiente de validación.", "warning");
                            }
                        } else if (message.event === "reporte_avance_validated") {
                            if (!isCurrentUser) {
                                const isTargetOperator = message.operario_id === user.id;
                                if (isTargetOperator) {
                                    const tipoNotif = message.estado === "validado" ? "success" : "error";
                                    const titNotif = message.estado === "validado" ? "Reporte Validado" : "Reporte Rechazado";
                                    
                                    const fechaInicioStr = message.fecha_inicio ? new Date(message.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
                                    const fechaFinStr = message.fecha_fin ? new Date(message.fecha_fin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
                                    const timeMsg = (fechaInicioStr && fechaFinStr) ? ` Tu supervisor ha registrado tu tiempo de ${fechaInicioStr} a ${fechaFinStr}.` : "";

                                    const msgNotif = message.estado === "validado" 
                                        ? `Tu reporte de la Orden ${message.orden_numero || ""} fue certificado con éxito.${timeMsg}` 
                                        : `Tu reporte de la Orden ${message.orden_numero || ""} fue rechazado por el supervisor.`;
                                    addNotification(titNotif, msgNotif, tipoNotif, {
                                        piezas_reportadas: message.piezas_reportadas,
                                        piezas_buenas: message.piezas_buenas,
                                        piezas_defectuosas: message.piezas_defectuosas,
                                        orden_numero: message.orden_numero
                                    });
                                }
                            }
                        }
                    }
                    
                    if (
                        message.event === "machine_updated" ||
                        message.event === "reporte_averia_created" ||
                        message.event === "reporte_averia_processed"
                    ) {
                        fetchMaquinas();
                        fetchReportesAveriaPendientes();

                        if (message.event === "reporte_averia_created") {
                            if (!isCurrentUser && user.rol !== "operario") {
                                const maquinaDetalle = message.maquina_codigo ? `${message.maquina_tipo || ""} (${message.maquina_codigo})` : "de la planta";
                                addNotification(
                                    "Máquina Bajo Revisión", 
                                    `Se reportó una avería en máquina ${maquinaDetalle}. El equipo ha pasado a BAJO REVISIÓN.`, 
                                    "warning"
                                );
                            }
                        } else if (message.event === "reporte_averia_processed") {
                            const estadoTxt = message.aprobado ? "FUERA DE SERVICIO" : "OPERATIVA";
                            if (user.rol === "operario") {
                                addNotification(
                                    message.aprobado ? "Avería Aprobada" : "Avería Rechazada",
                                    message.aprobado
                                        ? "Tu reporte de avería fue aprobado por el supervisor. La máquina pasa a FUERA DE SERVICIO."
                                        : "Tu reporte de avería fue rechazado por el supervisor. La máquina vuelve a estar OPERATIVA.",
                                    message.aprobado ? "error" : "info"
                                );
                            } else if (!isCurrentUser) {
                                addNotification(
                                    "Avería Procesada", 
                                    `Se evaluó el reporte de avería. La máquina ha pasado a ${estadoTxt}.`, 
                                    message.aprobado ? "error" : "info"
                                );
                            }
                        } else if (message.event === "machine_updated") {
                            if (!isCurrentUser && user.rol !== "operario") {
                                addNotification("Equipo Actualizado", "Se actualizó la información de un equipo de producción.", "info");
                            }
                        }
                    }
                    
                    if (message.event === "operator_updated") {
                        fetchOperarios();
                        if (!isCurrentUser && user.rol !== "operario") {
                            addNotification("Operario Actualizado", "Se ha actualizado la información de un operario.", "info");
                        }
                    }
                } catch (err) {
                    console.error("[Global WS] Error al procesar mensaje:", err);
                }
            };

            socket.onerror = (error) => {
                console.warn("[Global WS] Error en la conexión (se usará fallback de polling):", error);
                setIsWsConnected(false);
            };

            socket.onclose = () => {
                console.log("[Global WS] Desconectado. Reintentando conectar en 10 segundos...");
                setIsWsConnected(false);
                reconnectTimeout = setTimeout(connect, 10000);
            };
        };

        connect();

        return () => {
            if (socket) {
                socket.onclose = null;
                socket.close();
            }
            clearTimeout(reconnectTimeout);
        };
    }, [isAuthenticated, user, fetchOrdenes, fetchAsignaciones, fetchMaquinas, fetchOperarios, fetchReportesAveriaPendientes]);

    // Fallback de polling activo global si no hay conexión de WebSocket
    useEffect(() => {
        if (!isAuthenticated || !user || isWsConnected) return;

        console.log("[Global WS] Activando fallback de polling (cada 4 segundos)... En espera de reconexión WebSocket.");
        const interval = setInterval(() => {
            fetchOrdenes();
            fetchAsignaciones();
            fetchMaquinas();
            fetchOperarios();
            fetchReportesAveriaPendientes();
            if (user.rol !== "operario") {
                fetchPendientes();
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isWsConnected, isAuthenticated, user, fetchOrdenes, fetchAsignaciones, fetchMaquinas, fetchOperarios, fetchReportesAveriaPendientes, fetchPendientes]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login");
        }
    }, [mounted, isAuthenticated, router]);

    // Redireccion por defecto al login si el usuario es operador e intenta ir a otra parte,
    // o redirección principal despues de login
    useEffect(() => {
        if (mounted && user) {
            if (user.rol === "operario" && pathname !== "/mi-estacion" && pathname !== "/mi-historial") {
                router.push("/mi-estacion");
            } else if ((user.rol === "administrador" || user.rol === "subjefe") && pathname === "/") {
                router.push("/dashboard");
            }
        }
    }, [mounted, user, pathname, router]);


    const itemsVisibles = user ? NAV.filter(n => n.roles.includes(user.rol)) : [];

    if (!mounted || !isAuthenticated || !user) {
        return <div className="min-h-screen bg-[#080b10]" />; // Evitar flashes
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row" style={{ background: "#080b10" }}>
            {/* Sidebar para desktop */}
            <div className="hidden md:flex">
                <Sidebar rol={user.rol} usuario={`${user.nombre} ${user.apellido}`} />
            </div>

            {/* Navbar superior para mobile/tablet */}
            <header className="flex md:hidden items-center justify-between px-4 py-3 bg-[#13161e] border-b border-[#1e2130] sticky top-0 z-30 w-full shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                        aria-label="Abrir menú"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{
                                boxShadow: "0 2px 8px rgba(249,115,22,0.4)"
                            }}>
                            <img 
                                src="/icons/icon-192x192.png" 
                                alt="Meme Fábrica Logo" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-sm font-black text-white whitespace-nowrap">Meme Fábricas</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border"
                        style={{ 
                            background: `${ROL_COLOR[user.rol]}20`, 
                            color: ROL_COLOR[user.rol], 
                            borderColor: `${ROL_COLOR[user.rol]}40` 
                        }}>
                        {`${user.nombre} ${user.apellido}`.slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* Menú lateral (Drawer) móvil */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <aside className="relative flex w-72 max-w-[80vw] flex-col h-full bg-[#13161e] border-r border-[#1e2130] p-5 shadow-2xl transition-transform duration-300 animate-in slide-in-from-left">
                        {/* Close button */}
                        <div className="flex items-center justify-between pb-5 border-b border-[#1e2130] mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                    <img 
                                        src="/icons/icon-192x192.png" 
                                        alt="Meme Fábrica Logo" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-sm font-bold text-white">Meme Fábricas</span>
                            </div>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Enlaces de Navegación */}
                        <nav className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {itemsVisibles.map(item => {
                                const active = pathname === item.href;
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/5"
                                        style={{
                                            background: active ? "#f9731615" : "transparent",
                                            color: active ? "#f97316" : "#94a3b8",
                                        }}
                                    >
                                        <span className={active ? 'text-[#f97316]' : 'text-slate-400'}>
                                            {item.icon}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold whitespace-nowrap text-white">
                                                    {item.label}
                                                </span>
                                                {item.badge && (
                                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md"
                                                        style={{ background: `${item.badgeColor}20`, color: item.badgeColor }}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-slate-500 truncate">{item.desc}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Footer de Usuario */}
                        <div className="pt-4 border-t border-[#1e2130] space-y-4">
                            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#0d1018]/50 border border-[#1e2130]">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border"
                                    style={{ 
                                        background: `${ROL_COLOR[user.rol]}20`, 
                                        color: ROL_COLOR[user.rol], 
                                        borderColor: `${ROL_COLOR[user.rol]}40` 
                                    }}>
                                    {`${user.nombre} ${user.apellido}`.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{`${user.nombre} ${user.apellido}`}</p>
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-2.5 h-2.5" style={{ color: ROL_COLOR[user.rol] }} />
                                        <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: ROL_COLOR[user.rol] }}>{user.rol}</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    logout();
                                }} 
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-bold cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 shrink-0" />
                                Cerrar sesión
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Contenido principal */}
            <main className="flex-1 overflow-hidden flex flex-col relative w-full">
                {children}
                
                {/* Contenedor global de Toasts */}
                <ToastContainer toasts={toasts} onClose={removeToast} />

                {/* Modal global de detalles de notificación */}
                {selectedNotification && (
                    <NotificationDetailModal 
                        notification={selectedNotification} 
                        onClose={() => setSelectedNotification(null)} 
                    />
                )}
            </main>
        </div>
    );
}