"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { useAsignacionStore, useAsignacionActions } from "@/features/operarios/store/useAsignacionStore";
import { useOrdenStore, useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { StatCard } from "@/components/StatCard";

import { TareaAsignadaCard } from "@/features/operarios/components/TareaAsignadaCard";
import { FormularioReporteAvance } from "@/features/operarios/components/FormularioReporteAvance";
import { FormularioReporteFalla } from "@/features/maquinas/components/FormularioReporteFalla";
import { AppColors } from "@/shared/constants";
import { Factory, Zap, ClipboardList, CheckCircle2, AlertTriangle, AlertCircle, Clock, Wrench } from "lucide-react";

export default function MiEstacionPage() {
    const { user } = useAuthStore();

    const { operarios, isLoading: loadingOperarios } = useOperarioStore();
    const { fetchOperarios, iniciarSesion } = useOperarioActions();

    const { maquinas, reportesAveriaPendientes, isLoading: loadingMaquinas } = useMaquinasStore();
    const { fetchMaquinas, fetchReportesAveriaPendientes, reportarAveria } = useMaquinasActions();

    const { asignaciones } = useAsignacionStore();
    const { fetchAsignaciones, reportarAvance } = useAsignacionActions();

    const { ordenes } = useOrdenStore();
    const { fetchOrdenes } = useOrdenActions();
    const { addNotification } = useNotificationActions();



    // Referencia para rastrear los estados anteriores de las órdenes asignadas
    const prevOrdersRef = useRef<{ [key: string]: { estado: string; prioridad: string } } | null>(null);

    // Derivamos el operario y la máquina directamente del estado de los stores
    const miOperario = user && operarios.length > 0
        ? operarios.find(o => o.correo === user.correo || o.nombre === user.nombre) || null
        : null;

    // Buscar la máquina física que el operario tiene asignada actualmente
    const miMaquinaRaw = miOperario && miOperario.maquina_actual_id && maquinas.length > 0
        ? maquinas.find(m => m.id === miOperario.maquina_actual_id) || null
        : null;

    const hasPendingAveria = miMaquinaRaw && reportesAveriaPendientes.length > 0
        ? reportesAveriaPendientes.some(
            r => (r.maquina_id === miMaquinaRaw.id || r.maquina_codigo === miMaquinaRaw.codigo || (miOperario && r.operario_id === miOperario.id)) && r.estado === "pendiente"
        )
        : false;

    const miMaquina = miMaquinaRaw
        ? {
            ...miMaquinaRaw,
            estado: hasPendingAveria ? ("bajo_revision" as const) : miMaquinaRaw.estado
        }
        : null;

    const PRIORIDAD_VALORES: Record<string, number> = {
        urgente: 4,
        alta: 3,
        normal: 2,
        baja: 1
    };

    const misAsignacionesTodas = miOperario
        ? [...asignaciones]
            .filter(a => a.operario_id === miOperario.id)
            .sort((a, b) => {
                const ordenA = ordenes.find(o => o.id === a.orden_id);
                const ordenB = ordenes.find(o => o.id === b.orden_id);

                const prioA = PRIORIDAD_VALORES[ordenA?.prioridad || "normal"] || 0;
                const prioB = PRIORIDAD_VALORES[ordenB?.prioridad || "normal"] || 0;

                // 1. Prioridad de la orden (Urgente > Alta > Normal > Baja) - más significativa
                if (prioA !== prioB) {
                    return prioB - prioA;
                }

                // 2. Fecha de entrega estimada (más antigua/cercana primero) - desempate
                const dateA = ordenA?.fechaEntregaEstimada ? new Date(ordenA.fechaEntregaEstimada).getTime() : Infinity;
                const dateB = ordenB?.fechaEntregaEstimada ? new Date(ordenB.fechaEntregaEstimada).getTime() : Infinity;
                return dateA - dateB;
            })
        : [];

    const misAsignacionesActivas = misAsignacionesTodas.filter(a => {
        const ord = ordenes.find(o => o.id === a.orden_id);
        const isOrderCompleted = ord?.estado === "completada";
        const isTaskCompleted = a.piezas_completadas >= a.piezas_requeridas;
        return !isOrderCompleted && !isTaskCompleted;
    });

    const misAsignacionesCompletadas = misAsignacionesTodas.filter(a => {
        const ord = ordenes.find(o => o.id === a.orden_id);
        const isOrderCompleted = ord?.estado === "completada";
        const isTaskCompleted = a.piezas_completadas >= a.piezas_requeridas;
        return isOrderCompleted || isTaskCompleted;
    });

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
        fetchReportesAveriaPendientes();
        fetchAsignaciones();
        fetchOrdenes();
    }, [fetchOperarios, fetchMaquinas, fetchReportesAveriaPendientes, fetchAsignaciones, fetchOrdenes]);

    // Detección de cambios en tiempo real en las órdenes del operario
    useEffect(() => {
        if (misAsignacionesTodas.length === 0 || ordenes.length === 0) {
            return;
        }

        const currentStates: { [key: string]: { numero: string; estado: string; prioridad: string } } = {};

        misAsignacionesTodas.forEach(asig => {
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

                    addNotification(
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

                    addNotification(
                        `Prioridad Modificada — ${curr.numero}`,
                        `La prioridad cambió de "${prev.prioridad.toUpperCase()}" a "${curr.prioridad.toUpperCase()}".`,
                        tipo
                    );
                }
            }
        });

        prevOrdersRef.current = currentStates;
    }, [ordenes, misAsignacionesTodas]);

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

    // Calcular eficiencia basada en el tipo de la máquina asignada
    const habilidadEnMaquina = miMaquina && miOperario.habilidades.find(h => h.maquina === miMaquina.tipo);
    const eficiencia = habilidadEnMaquina && habilidadEnMaquina.nivel_eficiencia !== undefined
        ? `${habilidadEnMaquina.nivel_eficiencia}%`
        : "N/A";

    const estadoCfg = (() => {
        switch (miMaquina?.estado) {
            case "operativa":
                return { label: "OPERATIVA", color: "#34d399", icon: CheckCircle2 };
            case "bajo_revision":
                return { label: "REVISIÓN", color: "#fbbf24", icon: Clock };
            case "mantenimiento":
                return { label: "MANTENIMIENTO", color: "#f59e0b", icon: Wrench };
            case "fuera_servicio":
                return { label: "FUERA DE SERVICIO", color: "#f43f5e", icon: AlertTriangle };
            default:
                return { label: "DESCONOCIDO", color: "#94a3b8", icon: AlertTriangle };
        }
    })();

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Estación de Trabajo</h1>
                <p className="text-slate-400 font-medium">Bienvenido <span className="text-white">{miOperario.nombre}</span>.</p>
            </div>

            {/* Listado de Tareas Asignadas */}
            <div className="mb-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-orange-500" /> Mis Órdenes y Tareas Asignadas ({misAsignacionesActivas.length})
                </h2>

                {misAsignacionesActivas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {misAsignacionesActivas.map(asig => (
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
                        No tienes tareas pendientes asignadas por el supervisor en este momento.
                    </div>
                )}
            </div>

            {/* Spacer */}
            <div className="h-4"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard
                    label="Máquina Actual"
                    valor={miMaquina ? `${miMaquina.nombre} (${miMaquina.codigo})` : "Ninguna"}
                    icon={Factory}
                    color={AppColors.orange}
                />
                <StatCard
                    label="Eficiencia Estimada"
                    valor={eficiencia}
                    icon={Zap}
                    color="#818cf8"
                    labelColor="#818cf8"
                />
                <StatCard
                    label="Estado de Máquina"
                    valor={estadoCfg.label}
                    icon={estadoCfg.icon}
                    color={estadoCfg.color}
                    labelColor={estadoCfg.color}
                />
                <StatCard
                    label="Unidades Buenas"
                    valor={miOperario.piezas_buenas ?? 0}
                    icon={CheckCircle2}
                    color="#34d399"
                    labelColor="#34d399"
                />
                <StatCard
                    label="Unidades Defectuosas"
                    valor={miOperario.piezas_defectuosas ?? 0}
                    icon={AlertCircle}
                    color="#f43f5e"
                    labelColor="#f43f5e"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario de Producción */}
                <FormularioReporteAvance
                    miOperario={miOperario}
                    iniciarSesion={iniciarSesion}
                    misAsignaciones={misAsignacionesActivas}
                    ordenes={ordenes}
                    maquinaEstado={miMaquina?.estado}
                    maquinaActual={miMaquina?.tipo}
                    reportarAvance={reportarAvance}
                />

                {/* Formulario de Falla */}
                <FormularioReporteFalla
                    miMaquina={miMaquina}
                    miOperarioId={miOperario.id}
                    reportarAveria={reportarAveria}
                />
            </div>

        </div>
    );
}
