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
    const [isWsConnected, setIsWsConnected] = useState(false);

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
                    
                    if (
                        message.event === "order_created" ||
                        message.event === "order_updated" ||
                        message.event === "order_deleted"
                    ) {
                        fetchOrdenes();
                    }
                    
                    if (
                        message.event === "assignment_updated" ||
                        message.event === "reporte_avance_created" ||
                        message.event === "reporte_avance_validated"
                    ) {
                        fetchAsignaciones();
                    }
                    
                    if (
                        message.event === "machine_updated" ||
                        message.event === "reporte_averia_created"
                    ) {
                        fetchMaquinas();
                    }
                    
                    if (message.event === "operator_updated") {
                        fetchOperarios();
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
            <main className="flex-1 overflow-hidden flex flex-col">
                {children}
            </main>
        </div>
    );
}