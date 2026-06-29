"use client";
// ─────────────────────────────────────────────────────────────
// app/(protected)/layout.tsx — Layout con Sidebar para rutas protegidas
// ─────────────────────────────────────────────────────────────
// Usa este layout en: dashboard, ordenes, registro, operarios, insumos, ia
// La ruta /login usa su propio layout sin sidebar

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAsignacionActions } from "@/features/operarios/store/useAsignacionStore";
import { useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useValidacionActions } from "@/features/validacion/store/useValidacionStore";
import { ToastContainer } from "@/components/ToastContainer";
import { useToasts, useSelectedNotification, useNotificationActions } from "@/shared/store/useNotificationStore";
import { NotificationDetailModal } from "@/components/layout/NotificationDetailModal";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const { fetchAsignaciones } = useAsignacionActions();
    const { fetchOrdenes } = useOrdenActions();
    const { fetchMaquinas } = useMaquinasActions();
    const { fetchOperarios } = useOperarioActions();
    const { fetchPendientes } = useValidacionActions();
    const [isWsConnected, setIsWsConnected] = useState(false);
    const toasts = useToasts();
    const selectedNotification = useSelectedNotification();
    const { addNotification, addToastOnly, removeToast, setSelectedNotification } = useNotificationActions();

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
                            if (isCurrentUser) {
                                addToastOnly("Nueva Orden", "Has creado la orden de trabajo exitosamente.", "success");
                            } else if (user.rol !== "operario") {
                                addNotification("Nueva Orden", `Se ha creado la orden de trabajo ${message.numero || ""} en el sistema.`, "info");
                            }
                        } else if (message.event === "order_updated") {
                            if (isCurrentUser) {
                                addToastOnly("Orden Actualizada", `Has modificado la orden ${message.numero || ""} exitosamente.`, "success");
                            } else if (user.rol !== "operario") {
                                addNotification("Orden Actualizada", `Se ha modificado la orden de trabajo ${message.numero || ""}.`, "info");
                            }
                        } else if (message.event === "order_deleted") {
                            if (isCurrentUser) {
                                addToastOnly("Orden Eliminada", "Has eliminado la orden exitosamente.", "success");
                            } else if (user.rol !== "operario") {
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
                            if (isCurrentUser) {
                                addToastOnly("Avance Reportado", "Tu reporte de avance ha sido enviado al supervisor.", "success");
                            } else if (user.rol !== "operario") {
                                addNotification("Revisión Pendiente", "Un operario ha reportado avance de producción. Pendiente de validación.", "warning");
                            }
                        } else if (message.event === "reporte_avance_validated") {
                            if (isCurrentUser) {
                                addToastOnly("Avance Validado", "Has certificado el reporte de avance exitosamente.", "success");
                            } else {
                                const isTargetOperator = message.operario_id === user.id;
                                if (isTargetOperator) {
                                    const tipoNotif = message.estado === "validado" ? "success" : "error";
                                    const titNotif = message.estado === "validado" ? "Reporte Validado" : "Reporte Rechazado";
                                    const msgNotif = message.estado === "validado" 
                                        ? `Tu reporte de la Orden ${message.orden_numero || ""} fue certificado con éxito.` 
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
                        message.event === "reporte_averia_created"
                    ) {
                        fetchMaquinas();
                        if (message.event === "reporte_averia_created") {
                            if (isCurrentUser) {
                                addToastOnly("Avería Reportada", "El fallo de la máquina fue reportado con éxito al taller.", "success");
                            } else {
                                const maquinaDetalle = message.maquina_codigo ? `${message.maquina_tipo || ""} (${message.maquina_codigo})` : "de la planta";
                                addNotification(
                                    "Falla de Equipo", 
                                    `Se reportó una avería crítica en máquina ${maquinaDetalle}. Enviada a mantenimiento.`, 
                                    "error",
                                    {
                                        maquina_codigo: message.maquina_codigo,
                                        maquina_tipo: message.maquina_tipo,
                                        motivo: message.descripcion
                                    }
                                );
                            }
                        } else if (message.event === "machine_updated") {
                            if (isCurrentUser) {
                                addToastOnly("Equipo Actualizado", "Los cambios en la maquinaria fueron registrados.", "success");
                            } else if (user.rol !== "operario") {
                                addNotification("Equipo Actualizado", "Se actualizó la información de un equipo de producción.", "info");
                            }
                        }
                    }
                    
                    if (message.event === "operator_updated") {
                        fetchOperarios();
                        if (isCurrentUser) {
                            addToastOnly("Perfil Guardado", "Tus cambios de operario fueron registrados.", "success");
                        } else if (user.rol !== "operario") {
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
    }, [isAuthenticated, user, fetchOrdenes, fetchAsignaciones, fetchMaquinas, fetchOperarios]);

    // Fallback de polling activo global si no hay conexión de WebSocket
    useEffect(() => {
        if (!isAuthenticated || !user || isWsConnected) return;

        console.log("[Global WS] Activando fallback de polling (cada 5 segundos)... En espera de reconexión WebSocket.");
        const interval = setInterval(() => {
            fetchOrdenes();
            fetchAsignaciones();
            fetchMaquinas();
            fetchOperarios();
            if (user.rol !== "operario") {
                fetchPendientes();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isWsConnected, isAuthenticated, user, fetchOrdenes, fetchAsignaciones, fetchMaquinas, fetchOperarios]);

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
            if (user.rol === "operario" && pathname !== "/mi-estacion") {
                router.push("/mi-estacion");
            } else if ((user.rol === "administrador" || user.rol === "subjefe") && pathname === "/") {
                router.push("/dashboard");
            }
        }
    }, [mounted, user, pathname, router]);


    if (!mounted || !isAuthenticated || !user) {
        return <div className="min-h-screen bg-[#080b10]" />; // Evitar flashes
    }

    return (
        <div className="flex min-h-screen" style={{ background: "#080b10" }}>
            <Sidebar rol={user.rol} usuario={`${user.nombre} ${user.apellido}`} />
            {/* Contenido principal */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
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