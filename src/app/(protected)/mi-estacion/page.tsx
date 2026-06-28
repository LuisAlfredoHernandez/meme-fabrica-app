"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { useAsignacionStore, useAsignacionActions } from "@/features/operarios/store/useAsignacionStore";
import { useOrdenStore, useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { StatCard } from "@/components/StatCard";
import { ToastContainer } from "@/components/ToastContainer";
import { TareaAsignadaCard } from "@/features/operarios/components/TareaAsignadaCard";
import { FormularioReporteAvance } from "@/features/operarios/components/FormularioReporteAvance";
import { FormularioReporteFalla } from "@/features/maquinas/components/FormularioReporteFalla";
import { AppColors } from "@/shared/constants";
import { Factory, Zap, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";

export default function MiEstacionPage() {
    const { user } = useAuthStore();

    const { operarios, isLoading: loadingOperarios } = useOperarioStore();
    const { fetchOperarios } = useOperarioActions();

    const { maquinas, isLoading: loadingMaquinas } = useMaquinasStore();
    const { fetchMaquinas, reportarAveria } = useMaquinasActions();

    const { asignaciones } = useAsignacionStore();
    const { fetchAsignaciones, reportarAvance } = useAsignacionActions();

    const { ordenes } = useOrdenStore();
    const { fetchOrdenes } = useOrdenActions();

    // Estado local para notificaciones (Toasts)
    interface ToastNotification {
        id: string;
        titulo: string;
        mensaje: string;
        tipo: "info" | "warning" | "error" | "success";
    }
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    const addToast = (titulo: string, mensaje: string, tipo: "info" | "warning" | "error" | "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, titulo, mensaje, tipo }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 6000);
    };

    // Referencia para rastrear los estados anteriores de las órdenes asignadas
    const prevOrdersRef = useRef<{ [key: string]: { estado: string; prioridad: string } } | null>(null);

    // Derivamos el operario y la máquina directamente del estado de los stores
    const miOperario = user && operarios.length > 0
        ? operarios.find(o => o.correo === user.correo || o.nombre === user.nombre) || null
        : null;

    const miMaquina = miOperario?.maquinaActual && maquinas.length > 0
        ? maquinas.find(m => m.tipo === miOperario.maquinaActual) || null
        : null;

    const misAsignaciones = miOperario
        ? asignaciones.filter(a => a.operario_id === miOperario.id)
        : [];

    const ORDEN_ESTADO_STYLE: Record<string, { label: string; bg: string; text: string }> = {
        pendiente: { label: "Pendiente", bg: "bg-slate-500/10", text: "text-slate-400" },
        en_proceso: { label: "En proceso", bg: "bg-orange-500/10", text: "text-orange-400" },
        pausada: { label: "Pausada", bg: "bg-amber-500/10", text: "text-amber-400" },
        completada: { label: "Completada", bg: "bg-emerald-500/10", text: "text-emerald-400" },
        cancelada: { label: "Cancelada", bg: "bg-red-500/10", text: "text-red-400" },
    };

    const ORDEN_PRIO_STYLE: Record<string, { color: string; bg: string }> = {
        baja: { color: "#64748b", bg: "rgba(100,116,139,0.12)" },
        normal: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
        alta: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
        urgente: { color: "#f87171", bg: "rgba(248,113,113,0.15)" },
    };

    useEffect(() => {
        // Carga inicial
        fetchOperarios();
        fetchMaquinas();
        fetchAsignaciones();
        fetchOrdenes();

        // Obtener la URL del WebSocket basada en el endpoint de la API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
        const wsHost = apiUrl.replace(/^https?:\/\//, "");
        const wsUrl = `${wsProtocol}//${wsHost}/ws/updates`;

        console.log("Estableciendo WebSocket en:", wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("Mensaje de WebSocket recibido:", message);
                
                // Si ocurre algún cambio en las órdenes, refrescamos los datos
                if (
                    message.event === "order_created" ||
                    message.event === "order_updated" ||
                    message.event === "order_deleted"
                ) {
                    fetchAsignaciones();
                    fetchOrdenes();
                }
            } catch (err) {
                console.error("Error al procesar mensaje de WebSocket:", err);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket desconectado");
        };

        socket.onerror = (error) => {
            console.error("Error en WebSocket:", error);
        };

        return () => {
            socket.close();
        };
    }, [fetchOperarios, fetchMaquinas, fetchAsignaciones, fetchOrdenes]);

    // Detección de cambios en tiempo real en las órdenes del operario
    useEffect(() => {
        if (misAsignaciones.length === 0 || ordenes.length === 0) {
            return;
        }

        const currentStates: { [key: string]: { numero: string; estado: string; prioridad: string } } = {};
        
        misAsignaciones.forEach(asig => {
            const ord = ordenes.find(o => o.id === asig.orden_id);
            if (ord) {
                currentStates[ord.id] = {
                    numero: ord.numero,
                    estado: ord.estado,
                    prioridad: ord.prioridad
                };
            }
        });

        // Inicialización en la primera carga (no lanzar toasts)
        if (prevOrdersRef.current === null) {
            prevOrdersRef.current = currentStates;
            return;
        }

        const prevStates = prevOrdersRef.current;

        Object.keys(currentStates).forEach(id => {
            const curr = currentStates[id];
            const prev = prevStates[id];

            if (prev) {
                // Validar cambios de estado
                if (curr.estado !== prev.estado) {
                    let tipo: "info" | "warning" | "error" | "success" = "info";
                    if (curr.estado === "pausada") tipo = "warning";
                    if (curr.estado === "cancelada") tipo = "error";
                    if (curr.estado === "completada") tipo = "success";

                    addToast(
                        `Orden ${curr.numero} Actualizada`,
                        `El estado cambió de "${prev.estado.toUpperCase()}" a "${curr.estado.toUpperCase()}".`,
                        tipo
                    );
                }

                // Validar cambios de prioridad
                if (curr.prioridad !== prev.prioridad) {
                    let tipo: "info" | "warning" | "error" = "info";
                    if (curr.prioridad === "urgente") tipo = "error";
                    else if (curr.prioridad === "alta") tipo = "warning";

                    addToast(
                        `Prioridad Modificada — ${curr.numero}`,
                        `La prioridad cambió de "${prev.prioridad.toUpperCase()}" a "${curr.prioridad.toUpperCase()}".`,
                        tipo
                    );
                }
            } else {
                // Nueva orden detectada como asignada
                addToast(
                    `Nueva Orden Asignada`,
                    `Se te ha asignado la Orden ${curr.numero} (${curr.prioridad.toUpperCase()}).`,
                    "success"
                );
            }
        });

        prevOrdersRef.current = currentStates;
    }, [ordenes, misAsignaciones]);

    if (loadingOperarios || loadingMaquinas) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen text-slate-400">
                <Zap className="animate-spin w-8 h-8 text-orange-500 mr-4" /> Cargando mi estación...
            </div>
        );
    }

    if (!miOperario) {
        return (
            <div className="p-8 text-white">
                <h1 className="text-2xl font-bold mb-2">Mi Estación</h1>
                <p className="text-slate-400">No se encontró información de operario asignada a tu cuenta.</p>
            </div>
        );
    }

    // Calcular eficiencia
    const habilidadEnMaquina = miOperario.habilidades.find(h => h.maquina === miOperario.maquinaActual);
    const eficiencia = habilidadEnMaquina && habilidadEnMaquina.nivel_eficiencia !== undefined
        ? `${habilidadEnMaquina.nivel_eficiencia}%`
        : "N/A";

    return (
        <div className="p-8 overflow-y-auto max-h-screen custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Mi Estación de Trabajo</h1>
                <p className="text-slate-400 font-medium">Bienvenido <span className="text-white">{miOperario.nombre}</span>.</p>
            </div>

            {/* Listado de Tareas Asignadas */}
            <div className="mb-8 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-orange-500" /> Mis Órdenes y Tareas Asignadas ({misAsignaciones.length})
                </h2>

                {misAsignaciones.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {misAsignaciones.map(asig => (
                            <TareaAsignadaCard
                                key={asig.id}
                                asig={asig}
                                ordenCompleta={ordenes.find(o => o.id === asig.orden_id)}
                                prioridadStyle={ORDEN_PRIO_STYLE}
                                estadoStyle={ORDEN_ESTADO_STYLE}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center rounded-3xl bg-[#13161e] border border-white/5 text-slate-500 font-semibold italic text-sm">
                        No tienes tareas asignadas por el supervisor en este momento.
                    </div>
                )}
            </div>

            {/* Kpis / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Máquina Actual"
                    valor={miOperario.maquinaActual ? miOperario.maquinaActual.toUpperCase() : "Ninguna"}
                    icon={Factory}
                    color={AppColors.orange}
                />
                <StatCard
                    label="Eficiencia Estimada"
                    valor={eficiencia}
                    icon={Zap}
                    color="#34d399"
                    labelColor="#34d399"
                />
                <StatCard
                    label="Estado de Máquina"
                    valor={miMaquina?.estado ? miMaquina.estado.toUpperCase() : "Desconocido"}
                    icon={miMaquina?.estado === "operativa" ? CheckCircle2 : AlertTriangle}
                    color={miMaquina?.estado === "operativa" ? "#34d399" : "#f43f5e"}
                    labelColor={miMaquina?.estado === "operativa" ? "#34d399" : "#f43f5e"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario de Producción */}
                <FormularioReporteAvance
                    misAsignaciones={misAsignaciones}
                    ordenes={ordenes}
                    maquinaEstado={miMaquina?.estado}
                    maquinaActual={miOperario.maquinaActual}
                    reportarAvance={reportarAvance}
                />

                {/* Formulario de Falla */}
                <FormularioReporteFalla
                    miMaquina={miMaquina}
                    miOperarioId={miOperario.id}
                    reportarAveria={reportarAveria}
                />
            </div>

            {/* Contenedor de Notificaciones Toasts */}
            <ToastContainer
                toasts={toasts}
                onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
            />
        </div>
    );
}
