"use client";

// ============================================================
// features/ia-predictiva/PanelRecomendaciones.tsx
// Meme Fábricas · Panel de IA Predictiva
// ============================================================

import { useState, useMemo } from "react";
import {
    Brain,
    AlertTriangle,
    ArrowRight,
    UserCheck,
    Clock,
    Zap,
    CheckCheck,
    X,
    ChevronDown,
    Activity,
    Shield,
    RefreshCw,
    Info,
    TrendingUp,
} from "lucide-react";
import type {
    PrediccionIA,
    AlertaCuelloBottella,
    RecomendacionPersonal,
    Operario,
    Maquina,
    NivelAlerta,
} from "@/types";

// ─── Helpers de UI ────────────────────────────────────────────

const NIVEL_CONFIG: Record<
    NivelAlerta,
    { color: string; bg: string; border: string; icono: React.ReactNode; label: string }
> = {
    info: {
        color: "text-sky-400",
        bg: "bg-sky-400/10",
        border: "border-sky-400/30",
        icono: <Info className="w-4 h-4" />,
        label: "Informativo",
    },
    advertencia: {
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/30",
        icono: <AlertTriangle className="w-4 h-4" />,
        label: "Advertencia",
    },
    critica: {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/40",
        icono: <Zap className="w-4 h-4" />,
        label: "Crítico",
    },
};

const TIPO_MAQUINA_LABEL: Record<string, string> = {
    merrow: "Merrow",
    cover: "Cover",
    plana: "Plana",
    corte: "Corte",
    peso: "Peso",
    plancha_dtf: "Plancha DTF",
};

function formatearHoras(horas: number): string {
    if (horas < 1) return `${Math.round(horas * 60)} min`;
    return `${horas.toFixed(1)} hr${horas !== 1 ? "s" : ""}`;
}

function diasRestantes(fechaISO: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaISO);
    return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Sub-componente: Alerta de cuello de botella ──────────────

function TarjetaCuello({
    alerta,
    maquina,
}: {
    alerta: AlertaCuelloBottella;
    maquina?: Maquina;
}) {
    const [expandida, setExpandida] = useState(false);
    const cfg = NIVEL_CONFIG[alerta.nivel];

    return (
        <div
            className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}
        >
            <button
                onClick={() => setExpandida((v) => !v)}
                className="w-full flex items-start gap-3 p-4 text-left"
            >
                {/* Icono y nivel */}
                <div className={`shrink-0 mt-0.5 ${cfg.color}`}>{cfg.icono}</div>

                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}>
                            {cfg.label}
                        </span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-400 text-xs font-mono">
                            {TIPO_MAQUINA_LABEL[alerta.tipo] ?? alerta.tipo}
                            {maquina ? ` — ${maquina.codigo}` : ""}
                        </span>
                    </div>
                    <p className="text-white text-sm font-medium mt-1 leading-snug">{alerta.mensaje}</p>
                </div>

                {/* Saturación circular */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                        className={`text-lg font-black font-mono ${alerta.saturationPct >= 90
                            ? "text-red-400"
                            : alerta.saturationPct >= 70
                                ? "text-amber-400"
                                : "text-sky-400"
                            }`}
                    >
                        {alerta.saturationPct}%
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-slate-600 transition-transform ${expandida ? "rotate-180" : ""
                            }`}
                    />
                </div>
            </button>

            {/* Detalle expandido */}
            {expandida && (
                <div className="px-4 pb-4 border-t border-slate-800/50 pt-3 space-y-2">
                    {/* Barra de saturación */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Saturación de la máquina</span>
                            <span>{alerta.saturationPct}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${alerta.saturationPct >= 90
                                    ? "bg-red-500"
                                    : alerta.saturationPct >= 70
                                        ? "bg-amber-500"
                                        : "bg-sky-500"
                                    }`}
                                style={{ width: `${Math.min(alerta.saturationPct, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Impacto */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>
                            Impacto estimado:{" "}
                            <span className="text-white font-semibold">
                                {formatearHoras(alerta.impactoEstimadoHoras)}
                            </span>{" "}
                            de retraso
                        </span>
                    </div>

                    {maquina && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Activity className="w-3.5 h-3.5 text-slate-600" />
                            <span>
                                Capacidad:{" "}
                                <span className="text-white font-semibold">
                                    {maquina.capacidadPorHora} pzs/hr
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Sub-componente: Recomendación de personal ────────────────

function TarjetaRecomendacion({
    rec,
    empleados,
    maquinas,
    onAceptar,
    onRechazar,
}: {
    rec: RecomendacionPersonal;
    empleados: Operario[];
    maquinas: Maquina[];
    onAceptar: (id: string) => void;
    onRechazar: (id: string) => void;
}) {
    const empleado = empleados.find((e) => e.id === rec.empleadoId);
    const maqOrigen = maquinas.find((m) => m.id === rec.maquinaOrigenId);
    const maqDestino = maquinas.find((m) => m.id === rec.maquinaDestinoId);

    const colorPrioridad = {
        alta: "text-red-400 bg-red-400/10 border-red-400/30",
        media: "text-amber-400 bg-amber-400/10 border-amber-400/30",
        baja: "text-slate-400 bg-slate-700/30 border-slate-700",
    }[rec.prioridad];

    if (rec.aceptada !== undefined) {
        return (
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 flex items-center gap-3 opacity-60">
                {rec.aceptada ? (
                    <CheckCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                    <X className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <p className="text-slate-400 text-sm">
                    {rec.aceptada ? "Recomendación aplicada" : "Recomendación descartada"}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
            {/* Encabezado con prioridad */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400 font-medium">
                        {rec.tipo === "movimiento" ? "Movimiento de Personal" : rec.tipo}
                    </span>
                </div>
                <span
                    className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${colorPrioridad}`}
                >
                    {rec.prioridad}
                </span>
            </div>

            {/* Movimiento visual */}
            {rec.tipo === "movimiento" && (maqOrigen || maqDestino) && (
                <div className="mx-4 mb-3 flex items-center gap-2 bg-slate-900 rounded-xl p-3">
                    {/* Origen */}
                    <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 mb-1">Origen</p>
                        <p className="text-sm font-bold text-white">
                            {maqOrigen?.codigo ?? rec.etapaOrigen ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                            {maqOrigen ? TIPO_MAQUINA_LABEL[maqOrigen.tipo] : ""}
                        </p>
                    </div>

                    {/* Flecha con empleado */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/40">
                            <span className="text-xs font-bold text-orange-400">
                                {empleado
                                    ? `${empleado.nombre[0]}${empleado.apellido[0]}`
                                    : "?"}
                            </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-orange-500" />
                    </div>

                    {/* Destino */}
                    <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 mb-1">Destino</p>
                        <p className="text-sm font-bold text-orange-300">
                            {maqDestino?.codigo ?? rec.etapaDestino ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                            {maqDestino ? TIPO_MAQUINA_LABEL[maqDestino.tipo] : ""}
                        </p>
                    </div>
                </div>
            )}

            {/* Nombre del empleado */}
            {empleado && (
                <p className="px-4 text-sm text-white font-semibold">
                    {empleado.nombre} {empleado.apellido}
                </p>
            )}

            {/* Justificación */}
            <p className="px-4 mt-1.5 text-sm text-slate-400 leading-relaxed">
                {rec.justificacion}
            </p>

            {/* Ganancia estimada */}
            <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-400">
                    Ahorro estimado:{" "}
                    <span className="font-bold">{formatearHoras(rec.gananciaTiempoEstimadaHoras)}</span>
                </span>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 p-4 pt-3">
                <button
                    onClick={() => onRechazar(rec.id)}
                    className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                >
                    Ignorar
                </button>
                <button
                    onClick={() => onAceptar(rec.id)}
                    className="flex-2 flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
                >
                    Aplicar
                </button>
            </div>
        </div>
    );
}

// ─── Props del Panel Principal ───────────────────────────────

interface PanelRecomendacionesProps {
    prediccion: PrediccionIA | null;
    empleados: Operario[];
    maquinas: Maquina[];
    cargando?: boolean;
    onActualizarPrediccion?: () => void;
    onAceptarRecomendacion?: (id: string) => void;
    onRechazarRecomendacion?: (id: string) => void;
}

// ─── Componente Principal ─────────────────────────────────────

export function PanelRecomendaciones({
    prediccion,
    empleados,
    maquinas,
    cargando = false,
    onActualizarPrediccion,
    onAceptarRecomendacion,
    onRechazarRecomendacion,
}: PanelRecomendacionesProps) {
    const [tabActiva, setTabActiva] = useState<"alertas" | "personal" | "riesgos">("alertas");

    const conteos = useMemo(() => {
        if (!prediccion) return { alertas: 0, personal: 0, riesgos: 0, criticas: 0 };
        return {
            alertas: prediccion.cuellosBotella.length,
            personal: prediccion.recomendaciones.filter((r) => r.aceptada === undefined).length,
            riesgos: prediccion.factoresRiesgo.length,
            criticas: prediccion.cuellosBotella.filter((c) => c.nivel === "critica").length,
        };
    }, [prediccion]);

    const diasRestantesEntrega = prediccion
        ? diasRestantes(prediccion.fechaFinalizacionEstimada)
        : null;

    // ── Skeleton ──
    if (cargando) {
        return (
            <div className="bg-[#0f1117] rounded-2xl border border-slate-800 p-6 space-y-4 animate-pulse">
                <div className="h-6 w-48 bg-slate-800 rounded" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-800 rounded-xl" />
                    ))}
                </div>
                <div className="h-36 bg-slate-800 rounded-xl" />
            </div>
        );
    }

    // ── Sin predicción ──
    if (!prediccion) {
        return (
            <div className="bg-[#0f1117] rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-slate-600" />
                </div>
                <div className="text-center">
                    <p className="text-white font-semibold">Sin análisis disponible</p>
                    <p className="text-slate-500 text-sm mt-1">
                        Selecciona una orden activa para ver predicciones
                    </p>
                </div>
                {onActualizarPrediccion && (
                    <button
                        onClick={onActualizarPrediccion}
                        className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 active:scale-95 transition-all"
                    >
                        Analizar ahora
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-[#0f1117] rounded-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-[#13161e]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                            <Brain className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Panel de IA Predictiva</h3>
                            <p className="text-slate-500 text-xs">
                                Modelo {prediccion.modelVersion} ·{" "}
                                {new Date(prediccion.fechaGeneracion).toLocaleTimeString("es-DO", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>

                    {onActualizarPrediccion && (
                        <button
                            onClick={onActualizarPrediccion}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
                            title="Actualizar análisis"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Confianza del modelo */}
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Confianza del modelo</span>
                            <span className="font-mono text-slate-300">
                                {Math.round(prediccion.confianza * 100)}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${prediccion.confianza * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* KPIs de la predicción */}
            <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-slate-800">
                {/* Días restantes */}
                <div className="px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">Entrega estimada</p>
                    <div className="flex items-end gap-2">
                        <span
                            className={`text-3xl font-black font-mono ${diasRestantesEntrega !== null && diasRestantesEntrega < 3
                                ? "text-red-400"
                                : diasRestantesEntrega !== null && diasRestantesEntrega < 7
                                    ? "text-amber-400"
                                    : "text-white"
                                }`}
                        >
                            {diasRestantesEntrega !== null
                                ? diasRestantesEntrega <= 0
                                    ? "Hoy"
                                    : `${diasRestantesEntrega}d`
                                : "—"}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(prediccion.fechaFinalizacionEstimada).toLocaleDateString("es-DO", {
                            day: "2-digit",
                            month: "short",
                        })}
                    </p>
                </div>

                {/* Eficiencia actual */}
                <div className="px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">Eficiencia actual</p>
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-3xl font-black font-mono ${prediccion.eficienciaActual >= 90
                                ? "text-emerald-400"
                                : prediccion.eficienciaActual >= 70
                                    ? "text-amber-400"
                                    : "text-red-400"
                                }`}
                        >
                            {prediccion.eficienciaActual}%
                        </span>
                    </div>
                    <p
                        className={`text-xs mt-0.5 ${prediccion.tendenciaEficiencia === "mejorando"
                            ? "text-emerald-400"
                            : prediccion.tendenciaEficiencia === "empeorando"
                                ? "text-red-400"
                                : "text-amber-400"
                            }`}
                    >
                        {prediccion.tendenciaEficiencia === "mejorando"
                            ? "↑ Mejorando"
                            : prediccion.tendenciaEficiencia === "empeorando"
                                ? "↓ Disminuyendo"
                                : "→ Estable"}
                    </p>
                </div>
            </div>

            {/* Producción de hoy vs meta */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/30">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-400">Hoy: {prediccion.produccionRealHoy} pzs producidas</span>
                    <span className="text-xs text-slate-500">Meta: {prediccion.metaProduccionDiaria} pzs</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${prediccion.produccionRealHoy >= prediccion.metaProduccionDiaria
                            ? "bg-emerald-500"
                            : "bg-orange-500"
                            }`}
                        style={{
                            width: `${Math.min(
                                (prediccion.produccionRealHoy / prediccion.metaProduccionDiaria) * 100,
                                100
                            )}%`,
                        }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                {(
                    [
                        {
                            id: "alertas" as const,
                            label: "Cuellos de Botella",
                            count: conteos.alertas,
                            urgent: conteos.criticas > 0,
                        },
                        {
                            id: "personal" as const,
                            label: "Personal",
                            count: conteos.personal,
                            urgent: false,
                        },
                        {
                            id: "riesgos" as const,
                            label: "Riesgos",
                            count: conteos.riesgos,
                            urgent: false,
                        },
                    ] as const
                ).map(({ id, label, count, urgent }) => (
                    <button
                        key={id}
                        onClick={() => setTabActiva(id)}
                        className={`flex-1 py-3.5 text-xs font-semibold relative transition-all ${tabActiva === id
                            ? "text-orange-400 border-b-2 border-orange-500"
                            : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        {label}
                        {count > 0 && (
                            <span
                                className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${urgent
                                    ? "bg-red-500 text-white"
                                    : tabActiva === id
                                        ? "bg-orange-500/30 text-orange-400"
                                        : "bg-slate-700 text-slate-400"
                                    }`}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Contenido de tabs */}
            <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">

                {/* ── Tab: Cuellos de botella ── */}
                {tabActiva === "alertas" && (
                    <>
                        {prediccion.cuellosBotella.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
                                <Shield className="w-8 h-8 opacity-40" />
                                <p className="text-sm">Sin cuellos de botella detectados</p>
                            </div>
                        ) : (
                            prediccion.cuellosBotella
                                .sort((a, b) => {
                                    const order = { critica: 0, advertencia: 1, info: 2 };
                                    return order[a.nivel] - order[b.nivel];
                                })
                                .map((alerta) => (
                                    <TarjetaCuello
                                        key={alerta.maquinaId + alerta.timestamp}
                                        alerta={alerta}
                                        maquina={maquinas.find((m) => m.id === alerta.maquinaId)}
                                    />
                                ))
                        )}
                    </>
                )}

                {/* ── Tab: Personal ── */}
                {tabActiva === "personal" && (
                    <>
                        {prediccion.recomendaciones.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
                                <UserCheck className="w-8 h-8 opacity-40" />
                                <p className="text-sm">Sin movimientos de personal sugeridos</p>
                            </div>
                        ) : (
                            prediccion.recomendaciones
                                .sort((a, b) => {
                                    const order = { alta: 0, media: 1, baja: 2 };
                                    return order[a.prioridad] - order[b.prioridad];
                                })
                                .map((rec) => (
                                    <TarjetaRecomendacion
                                        key={rec.id}
                                        rec={rec}
                                        empleados={empleados}
                                        maquinas={maquinas}
                                        onAceptar={(id) => onAceptarRecomendacion?.(id)}
                                        onRechazar={(id) => onRechazarRecomendacion?.(id)}
                                    />
                                ))
                        )}
                    </>
                )}

                {/* ── Tab: Factores de riesgo ── */}
                {tabActiva === "riesgos" && (
                    <>
                        {prediccion.factoresRiesgo.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
                                <Shield className="w-8 h-8 opacity-40" />
                                <p className="text-sm">Sin factores de riesgo identificados</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {prediccion.factoresRiesgo.map((riesgo, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-400/5 border border-amber-400/20"
                                    >
                                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-slate-300">{riesgo}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>

            {/* Footer — marca de IA */}
            <div className="px-5 py-3 border-t border-slate-800 bg-[#13161e] flex items-center justify-between">
                <span className="text-xs text-slate-600">
                    Powered by Scikit-learn · {prediccion.modelVersion}
                </span>
                <span className="text-xs text-slate-600">
                    Actualizado{" "}
                    {new Date(prediccion.fechaGeneracion).toLocaleTimeString("es-DO", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>
        </div>
    );
}

export default PanelRecomendaciones;