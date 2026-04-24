"use client";

// ============================================================
// features/dashboard/GraficaEficiencia.tsx
// Meme Fábricas · Producción Real vs Meta Proyectada
// ============================================================

import { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    type TooltipProps,
    TooltipContentProps,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────

interface PuntoDato {
    fecha: string; // "DD/MM" para display
    fechaCompleta: string; // ISO para cálculos
    real: number; // piezas producidas (acumulado)
    meta: number; // meta proyectada (acumulado)
    prediccion?: number; // predicción de IA (solo días futuros)
    eficiencia: number; // % eficiencia diaria
}

interface GraficaEficienciaProps {
    datos: PuntoDato[];
    titulo?: string;
    ordenNumero?: string;
    totalMeta?: number;
    loading?: boolean;
}

type VistaGrafica = "acumulado" | "diario" | "eficiencia";

// ─── Tooltip personalizado ────────────────────────────────────

const TooltipPersonalizado = (
    props: TooltipContentProps<number, string>) => {
    const { active, payload, label } = props;

    if (!active || !payload?.length) return null;
    const items: { nombre: string; valor: number; color: string; sufijo: string }[] = [];

    payload.forEach((p) => {
        if (p.value === undefined || p.value === null) return;
        const mapa: Record<string, { nombre: string; color: string; sufijo: string }> = {
            real: { nombre: "Real", color: "#f97316", sufijo: " pzs" },
            meta: { nombre: "Meta", color: "#64748b", sufijo: " pzs" },
            prediccion: { nombre: "Predicción IA", color: "#818cf8", sufijo: " pzs" },
            eficiencia: { nombre: "Eficiencia", color: "#34d399", sufijo: "%" },
        };
        const info = mapa[p.dataKey as string];
        if (info) items.push({ ...info, valor: p.value as number });
    });

    return (
        <div className="bg-[#1a1d28] border border-slate-700 rounded-xl p-3 shadow-2xl min-w-[160px]">
            <p className="text-slate-400 text-xs font-medium mb-2">{label}</p>
            <div className="space-y-1.5">
                {items.map((item) => (
                    <div key={item.nombre} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-slate-300 text-xs">{item.nombre}</span>
                        </div>
                        <span className="text-white text-xs font-bold font-mono">
                            {item.valor.toLocaleString()}
                            {item.sufijo}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Componente Principal ─────────────────────────────────────

export function GraficaEficiencia({
    datos,
    titulo = "Producción vs Meta",
    ordenNumero,
    totalMeta = 0,
    loading = false,
}: GraficaEficienciaProps) {
    const [vista, setVista] = useState<VistaGrafica>("acumulado");

    // ── Calcular métricas resumen ──
    const metricas = useMemo(() => {
        if (!datos.length)
            return { totalReal: 0, diferencia: 0, tendencia: "estable" as const, eficienciaPromedio: 0 };

        const ultimo = datos[datos.length - 1];
        const totalReal = ultimo.real;
        const diferencia = totalReal - ultimo.meta;
        const eficienciaPromedio = Math.round(
            datos.reduce((acc, d) => acc + d.eficiencia, 0) / datos.length
        );

        // Tendencia: compara últimos 3 días vs 3 anteriores
        if (datos.length >= 6) {
            const recientes = datos.slice(-3);
            const anteriores = datos.slice(-6, -3);
            const promedioReciente =
                recientes.reduce((a, d) => a + d.eficiencia, 0) / recientes.length;
            const promedioAnterior =
                anteriores.reduce((a, d) => a + d.eficiencia, 0) / anteriores.length;
            const tendencia =
                promedioReciente > promedioAnterior + 3
                    ? ("mejorando" as const)
                    : promedioReciente < promedioAnterior - 3
                        ? ("empeorando" as const)
                        : ("estable" as const);
            return { totalReal, diferencia, tendencia, eficienciaPromedio };
        }

        return { totalReal, diferencia, tendencia: "estable" as const, eficienciaPromedio };
    }, [datos]);

    // ── Preparar datos según vista ──
    const datosMostrados = useMemo(() => {
        if (vista !== "diario") return datos;
        // Para vista diaria, desacumular
        return datos.map((d, i) => ({
            ...d,
            real: i === 0 ? d.real : d.real - datos[i - 1].real,
            meta: i === 0 ? d.meta : d.meta - datos[i - 1].meta,
        }));
    }, [datos, vista]);

    const progresoPct = totalMeta > 0
        ? Math.round((metricas.totalReal / totalMeta) * 100)
        : 0;

    const tendenciaIcono = {
        mejorando: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        estable: <Minus className="w-4 h-4 text-amber-400" />,
        empeorando: <TrendingDown className="w-4 h-4 text-red-400" />,
    }[metricas.tendencia];

    const tendenciaColor = {
        mejorando: "text-emerald-400",
        estable: "text-amber-400",
        empeorando: "text-red-400",
    }[metricas.tendencia];

    // ── Skeleton de carga ──
    if (loading) {
        return (
            <div className="bg-[#0f1117] rounded-2xl border border-slate-800 p-6 animate-pulse">
                <div className="h-6 w-48 bg-slate-800 rounded mb-6" />
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-slate-800 rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-slate-800 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="bg-[#0f1117] rounded-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-[#13161e]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-orange-400" />
                            <h3 className="text-base font-bold text-white">{titulo}</h3>
                        </div>
                        {ordenNumero && (
                            <p className="text-slate-500 text-xs mt-0.5">Orden {ordenNumero}</p>
                        )}
                    </div>

                    {/* Selector de vista */}
                    <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg">
                        {(
                            [
                                { valor: "acumulado", label: "Acum." },
                                { valor: "diario", label: "Diario" },
                                { valor: "eficiencia", label: "Efic." },
                            ] as const
                        ).map(({ valor, label }) => (
                            <button
                                key={valor}
                                onClick={() => setVista(valor)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${vista === valor
                                    ? "bg-orange-500 text-white"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Métricas resumen */}
            <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
                {/* Producción total */}
                <div className="px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">Producción total</p>
                    <p className="text-2xl font-black text-white font-mono">
                        {metricas.totalReal.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">piezas</p>
                </div>

                {/* vs Meta */}
                <div className="px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">vs Meta</p>
                    <p
                        className={`text-2xl font-black font-mono ${metricas.diferencia >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                    >
                        {metricas.diferencia >= 0 ? "+" : ""}
                        {metricas.diferencia.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">piezas</p>
                </div>

                {/* Eficiencia + tendencia */}
                <div className="px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">Eficiencia prom.</p>
                    <div className="flex items-center gap-2">
                        <p
                            className={`text-2xl font-black font-mono ${metricas.eficienciaPromedio >= 90
                                ? "text-emerald-400"
                                : metricas.eficienciaPromedio >= 70
                                    ? "text-amber-400"
                                    : "text-red-400"
                                }`}
                        >
                            {metricas.eficienciaPromedio}%
                        </p>
                        <div className="flex items-center gap-1">
                            {tendenciaIcono}
                        </div>
                    </div>
                    <p className={`text-xs mt-0.5 ${tendenciaColor}`}>
                        {metricas.tendencia === "mejorando"
                            ? "Mejorando"
                            : metricas.tendencia === "empeorando"
                                ? "Bajando"
                                : "Estable"}
                    </p>
                </div>
            </div>

            {/* Barra de progreso global */}
            {totalMeta > 0 && (
                <div className="px-6 py-3 border-b border-slate-800 bg-[#13161e]">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-slate-400">
                            Progreso hacia meta total ({totalMeta.toLocaleString()} pzs)
                        </p>
                        <span
                            className={`text-xs font-bold ${progresoPct >= 100
                                ? "text-emerald-400"
                                : progresoPct >= 70
                                    ? "text-orange-400"
                                    : "text-slate-400"
                                }`}
                        >
                            {progresoPct}%
                        </span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${progresoPct >= 100
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-orange-600 to-orange-400"
                                }`}
                            style={{ width: `${Math.min(progresoPct, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Gráfica principal */}
            <div className="p-6">
                {datos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
                        <Calendar className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Sin datos de producción aún</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        {vista === "eficiencia" ? (
                            <ComposedChart
                                data={datosMostrados}
                                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1e2130"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="fecha"
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 110]}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<TooltipPersonalizado active={false} payload={[]} coordinate={undefined} accessibilityLayer={false} activeIndex={undefined} />} />
                                <ReferenceLine
                                    y={100}
                                    stroke="#f97316"
                                    strokeDasharray="4 4"
                                    strokeOpacity={0.5}
                                    label={{
                                        value: "Meta 100%",
                                        fill: "#f97316",
                                        fontSize: 10,
                                        position: "insideTopRight",
                                    }}
                                />
                                <Bar
                                    dataKey="eficiencia"
                                    fill="#f97316"
                                    radius={[4, 4, 0, 0]}
                                    fillOpacity={0.8}
                                />
                            </ComposedChart>
                        ) : (
                            <ComposedChart
                                data={datosMostrados}
                                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                            >
                                <defs>
                                    <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradPrediccion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1e2130"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="fecha"
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<TooltipPersonalizado active={false} payload={[]} coordinate={undefined} accessibilityLayer={false} activeIndex={undefined} />} />
                                <Legend
                                    wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                                    formatter={(value) => {
                                        const mapa: Record<string, string> = {
                                            meta: "Meta proyectada",
                                            real: "Producción real",
                                            prediccion: "Predicción IA",
                                        };
                                        return (
                                            <span style={{ color: "#94a3b8" }}>{mapa[value] ?? value}</span>
                                        );
                                    }}
                                />
                                {/* Meta como línea punteada discreta */}
                                <Line
                                    type="monotone"
                                    dataKey="meta"
                                    stroke="#475569"
                                    strokeWidth={2}
                                    strokeDasharray="6 3"
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#475569" }}
                                />
                                {/* Predicción IA */}
                                <Area
                                    type="monotone"
                                    dataKey="prediccion"
                                    stroke="#818cf8"
                                    strokeWidth={2}
                                    strokeDasharray="4 2"
                                    fill="url(#gradPrediccion)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#818cf8" }}
                                />
                                {/* Real como área destacada */}
                                <Area
                                    type="monotone"
                                    dataKey="real"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fill="url(#gradReal)"
                                    dot={{ fill: "#f97316", r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </ComposedChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>

            {/* Leyenda inferior con contexto */}
            <div className="px-6 pb-5 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-orange-500 inline-block" /> Producción real
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 border-t-2 border-dashed border-slate-500 inline-block" /> Meta proyectada
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 border-t-2 border-dashed border-indigo-400 inline-block" /> Predicción IA
                </span>
            </div>
        </div>
    );
}

export default GraficaEficiencia;