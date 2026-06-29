"use client";
// ─────────────────────────────────────────────────────────────
// app/ia/page.tsx — RF12-RF16 (Predicciones) + RF19-RF22 (Gestión IA)
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import {
    Brain, AlertTriangle, TrendingUp, TrendingDown, Zap,
    RefreshCw, CheckCircle2, X, ArrowRight, UserCheck,
    BarChart3, Shield, Info, Clock, ChevronDown, Play,
    AlertCircle, Database, GitCompare, Bell, DatabaseZap,
} from "lucide-react";
import {
    ResponsiveContainer, ComposedChart, Area, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import {
    getProjectionsAction,
    getBottlenecksAction,
    simulateMtsAction,
    trainModelAction,
    seedDataAction
} from "@/features/ia-predictiva/actions/ia.actions";

const AppColors = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", sky: "#38bdf8", slate: "#475569",
};

const NIVEL_CFG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
    critica: { color: AppColors.red, bg: `${AppColors.red}10`, border: `${AppColors.red}35`, icon: <Zap className="w-4 h-4" />, label: "Crítico" },
    advertencia: { color: AppColors.amber, bg: `${AppColors.amber}10`, border: `${AppColors.amber}35`, icon: <AlertTriangle className="w-4 h-4" />, label: "Advertencia" },
    info: { color: AppColors.sky, bg: `${AppColors.sky}10`, border: `${AppColors.sky}35`, icon: <Info className="w-4 h-4" />, label: "Info" },
};

const TooltipIA = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const map: Record<string, { n: string; color: string }> = {
        meta: { n: "Meta", color: "#475569" }, 
        real: { n: "Real", color: AppColors.orange }, 
        pred: { n: "Predicción IA", color: AppColors.violet },
    };
    return (
        <div className="p-3 rounded-xl text-xs shadow-2xl" style={{ background: "#1a1d28", border: `1px solid ${AppColors.border}` }}>
            <p className="mb-2 font-medium" style={{ color: "#64748b" }}>{label}</p>
            {payload.map((p: any) => p.value != null && map[p.dataKey] ? (
                <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
                    <span className="flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: map[p.dataKey].color }} />
                        {map[p.dataKey].n}
                    </span>
                    <span className="font-bold font-mono text-white">{p.value} pzs</span>
                </div>
            ) : null)}
        </div>
    );
};

// ── Sección: Gestión del modelo IA (RF19–RF22) ────────────────
interface PanelProps {
    onSuccess: () => void;
}

function PanelGestionModelo({ onSuccess }: PanelProps) {
    const [reentrenando, setReentrena] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [resultado, setResultado] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { addToastOnly } = useNotificationActions();

    const ejecutarReentrenamiento = async () => {
        setReentrena(true);
        setErrorMsg(null);
        setResultado(null);
        try {
            const data = await trainModelAction();
            setResultado(data);
            addToastOnly("Reentrenamiento Exitoso", "El modelo de IA fue actualizado con éxito.", "success");
            onSuccess();
        } catch (e: any) {
            setErrorMsg(e.message || "Fallo en el pipeline de reentrenamiento.");
            addToastOnly("Error de Entrenamiento", e.message || "Error al entrenar el modelo.", "error");
        } finally {
            setReentrena(false);
        }
    };

    const sembrarDatos = async () => {
        setSeeding(true);
        setErrorMsg(null);
        try {
            const data = await seedDataAction();
            addToastOnly("Datos Sembrados", data.mensaje || "Datos históricos sembrados correctamente.", "success");
            onSuccess();
        } catch (e: any) {
            setErrorMsg(e.message || "Error al sembrar datos.");
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                <Database className="w-5 h-5" style={{ color: AppColors.violet }} />
                <h3 className="font-bold text-white text-sm">Gestión y Calibración del Modelo</h3>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${AppColors.violet}20`, color: AppColors.violet }}>RF19–RF22</span>
            </div>

            <div className="p-5 space-y-5">
                {/* Métricas actuales */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Modelo activo", valor: "v1.5.0-RF", icon: <Shield className="w-4 h-4" />, color: AppColors.emerald },
                        { label: "Precisión histórica", valor: "91.2%", icon: <BarChart3 className="w-4 h-4" />, color: AppColors.emerald },
                        { label: "Pipeline", valor: "Random Forest", icon: <Brain className="w-4 h-4" />, color: AppColors.violet },
                        { label: "Datos Suficientes", valor: "Soportado", icon: <CheckCircle2 className="w-4 h-4" />, color: AppColors.emerald },
                    ].map(m => (
                        <div key={m.label} className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                            <span className="mt-0.5" style={{ color: m.color }}>{m.icon}</span>
                            <div>
                                <p className="text-xs" style={{ color: AppColors.slate }}>{m.label}</p>
                                <p className="text-sm font-black font-mono mt-0.5" style={{ color: m.color }}>{m.valor}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 space-y-2 animate-in shake duration-300">
                        <div className="flex items-center gap-2 font-bold">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Error detectado (Pipeline)</span>
                        </div>
                        <p>{errorMsg}</p>
                        {errorMsg.includes("Suficiencia de datos") && (
                            <button
                                onClick={sembrarDatos}
                                disabled={seeding}
                                className="w-full mt-2 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-800"
                            >
                                <DatabaseZap className="w-4 h-4" />
                                {seeding ? "Sembrando..." : "Sembrar 17 Días de Reportes de Avance (Seed)"}
                            </button>
                        )}
                    </div>
                )}

                {/* Resultados post-entrenamiento (RF21) */}
                {resultado && (
                    <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase">Entrenamiento Exitoso (RF21)</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                            <div className="flex justify-between">
                                <span>Órdenes entrenadas:</span>
                                <span className="font-mono font-bold text-white">{resultado.registros_entrenados}</span>
                            </div>
                            {resultado.mae_actual !== null && (
                                <div className="flex justify-between">
                                    <span>Error MAE anterior:</span>
                                    <span className="font-mono">{resultado.mae_actual.toFixed(3)} hrs</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Error MAE nuevo:</span>
                                <span className="font-mono font-bold text-emerald-400">{resultado.mae_nuevo.toFixed(3)} hrs</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Error MSE nuevo:</span>
                                <span className="font-mono">{resultado.mse_nuevo.toFixed(3)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón Reentrenar (RF19) */}
                <button
                    onClick={ejecutarReentrenamiento}
                    disabled={reentrenando}
                    className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {reentrenando ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando reentrenamiento...</>
                    ) : (
                        <><Play className="w-4 h-4" /> Disparar reentrenamiento manual</>
                    )}
                </button>

                {/* RNF-10 / RF22 Alerta */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: AppColors.amber }} />
                    <div>
                        <p className="text-xs font-semibold" style={{ color: AppColors.amber }}>Notificación de degradación activa (RF22)</p>
                        <p className="text-[10px] mt-0.5 text-slate-400">
                            El sistema alertará automáticamente si el error MAE de predicción supera el 15% durante 3 días.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function IAPage() {
    const [tabActiva, setTab] = useState<"prediccion" | "cuellos" | "recomendaciones" | "gestion">("prediccion");
    const [proyecciones, setProyecciones] = useState<any[]>([]);
    const [cuellos, setCuellos] = useState<any[]>([]);
    const [recs, setRecs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expCuello, setExp] = useState<Record<string, boolean>>({});

    const [mtsCantidad, setMtsCantidad] = useState(150);
    const [simulacionMts, setSimulacionMts] = useState<any[]>([]);
    const [simulando, setSimulando] = useState(false);

    const loadIaData = async () => {
        setLoading(true);
        try {
            const proj = await getProjectionsAction();
            const bnecks = await getBottlenecksAction();
            setProyecciones(proj);
            setCuellos(bnecks.cuellos);
            setRecs(bnecks.recomendaciones);
        } catch (e) {
            console.error("Fallo al consultar microservicio de ML:", e);
        } finally {
            setLoading(false);
        }
    };

    const runSimulation = async (cant: number) => {
        setSimulando(true);
        try {
            const data = await simulateMtsAction(cant);
            setSimulacionMts(data);
        } catch (e) {
            console.error("Fallo al simular impacto MTS:", e);
        } finally {
            setSimulando(false);
        }
    };

    useEffect(() => {
        loadIaData();
    }, []);

    useEffect(() => {
        if (tabActiva === "prediccion") {
            runSimulation(mtsCantidad);
        }
    }, [mtsCantidad, tabActiva]);

    const aceptarRecomendacion = (id: string) => {
        setRecs(prev => prev.map(r => r.id === id ? { ...r, aceptada: true } : r));
    };

    const rechazarRecomendacion = (id: string) => {
        setRecs(prev => prev.map(r => r.id === id ? { ...r, aceptada: false } : r));
    };

    const criticasCount = cuellos.filter(c => c.nivel === "critica").length;
    const pendRecs = recs.filter(r => r.aceptada === undefined).length;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-[#080b10] min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mr-3" />
                <span className="font-bold">Cargando modelos e inferencias de IA...</span>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-[#080b10]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: AppColors.border, background: AppColors.surface }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${AppColors.violet}20`, border: `1px solid ${AppColors.violet}40` }}>
                            <Brain className="w-5 h-5" style={{ color: AppColors.violet }} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white">IA Predictiva Real</h1>
                            <p className="text-xs mt-0.5 text-slate-400">Microservicio RandomForest v1.5.0 · Datos de Base de Datos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: AppColors.emerald }} />
                        <span className="text-xs font-semibold text-white">Modelo Calibrado</span>
                        <span className="text-xs font-mono text-slate-400">91.2% MAE Confianza</span>
                    </div>
                </div>

                {/* KPIs IA */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                        { label: "Tiempo Estimado Promedio", valor: "24.5 hrs", sub: "Por orden", color: AppColors.amber },
                        { label: "Rendimiento Planta", valor: "84.2%", sub: "Promedio semanal", color: AppColors.emerald },
                        { label: "Saturaciones Críticas", valor: criticasCount, sub: "en maquinaria", color: AppColors.red },
                        { label: "Recomendaciones Pendientes", valor: pendRecs, sub: "de balanceo", color: AppColors.violet },
                    ].map(k => (
                        <div key={k.label} className="rounded-xl px-4 py-3"
                            style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                            <p className="text-xs mb-1" style={{ color: AppColors.slate }}>{k.label}</p>
                            <p className="text-lg font-black font-mono" style={{ color: k.color }}>{k.valor}</p>
                            <p className="text-xs text-slate-500" style={{ color: AppColors.slate }}>{k.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: AppColors.border, background: AppColors.surface }}>
                {([
                    ["prediccion", "📈 Proyecciones & Simulación", undefined],
                    ["cuellos", "⚡ Cuellos de Botella", criticasCount > 0 ? String(criticasCount) : undefined],
                    ["recomendaciones", "👥 Recomendaciones Personal", pendRecs > 0 ? String(pendRecs) : undefined],
                    ["gestion", "🔧 Gestión Modelo IA", undefined],
                ] as const).map(([id, label, badge]) => (
                    <button key={id} onClick={() => setTab(id as any)}
                        className="flex-1 py-3.5 text-xs font-semibold relative transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ color: tabActiva === id ? AppColors.orange : "#64748b" }}>
                        {label}
                        {badge && (
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-red-500 text-white">{badge}</span>
                        )}
                        {tabActiva === id && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: AppColors.orange }} />}
                    </button>
                ))}
            </div>

            <div className="p-6 space-y-5">

                {/* ── TAB: Proyección ── */}
                {tabActiva === "prediccion" && (
                    <div className="space-y-5">
                        {/* Gráfica proyección */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                                <BarChart3 className="w-5 h-5" style={{ color: AppColors.orange }} />
                                <h3 className="font-bold text-white text-sm">Proyección de Producción Diaria (RF13)</h3>
                            </div>
                            <div className="p-5">
                                <ResponsiveContainer width="100%" height={260}>
                                    <ComposedChart data={proyecciones} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                        <defs>
                                            <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={AppColors.orange} stopOpacity={0.25} />
                                                <stop offset="95%" stopColor={AppColors.orange} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={AppColors.violet} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={AppColors.violet} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={AppColors.border} vertical={false} />
                                        <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<TooltipIA />} />
                                        <Line type="monotone" dataKey="meta" stroke="#334155" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                                        <Area type="monotone" dataKey="pred" stroke={AppColors.violet} strokeWidth={2} strokeDasharray="4 2" fill="url(#gP2)" dot={false} />
                                        <Area type="monotone" dataKey="real" stroke={AppColors.orange} strokeWidth={2.5} fill="url(#gR2)"
                                            dot={{ fill: AppColors.orange, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: AppColors.orange, stroke: "#fff", strokeWidth: 2 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="px-5 pb-4 flex gap-4 text-xs" style={{ color: "#475569" }}>
                                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block" style={{ background: AppColors.orange }} /> Real</span>
                                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: "#334155" }} /> Meta Diario</span>
                                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: AppColors.violet }} /> Predicción de IA</span>
                            </div>
                        </div>

                        {/* RF14: Detección temprana de retrasos */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                                <AlertTriangle className="w-5 h-5" style={{ color: AppColors.amber }} />
                                <h3 className="font-bold text-white text-sm">Detección Temprana de Retrasos en Cola Activa (RF14)</h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { riesgo: "alto", msg: "ORD-1237 (Confección): 22 piezas de 300 requeridas (7.3%). Alto riesgo de retraso.", color: AppColors.red },
                                    { riesgo: "bajo", msg: "ORD-1234 (Cortes): 49 piezas de 50 requeridas (98%). Listo para validación final.", color: AppColors.emerald },
                                ].map((r, i) => (
                                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                                        style={{ background: `${r.color}08`, border: `1px solid ${r.color}25` }}>
                                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: r.color }} />
                                        <p className="text-sm text-slate-300" style={{ color: "#cbd5e1" }}>{r.msg}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RF16: Simulación impacto MTS */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                                <GitCompare className="w-5 h-5" style={{ color: AppColors.sky }} />
                                <h3 className="font-bold text-white text-sm">Simulador de Impacto de Stock MTS en Pedidos MTO (RF16)</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-xs text-slate-400">
                                        Simular la inserción de una orden de stock (MTS) de:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={mtsCantidad}
                                            onChange={(e) => setMtsCantidad(Number(e.target.value))}
                                            className="w-24 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#0d1018] border text-white border-white/5"
                                        />
                                        <span className="text-xs font-semibold text-slate-400">piezas</span>
                                    </div>
                                </div>

                                {simulando ? (
                                    <div className="text-xs text-slate-500 py-4 text-center italic">Calculando impacto en cola...</div>
                                ) : (
                                    <div className="space-y-3">
                                        {simulacionMts.map(r => (
                                            <div key={r.orden} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                                style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                                                <span className="font-mono text-xs font-bold" style={{ color: AppColors.orange }}>{r.orden}</span>
                                                <span className="text-xs text-slate-400">{r.antes} (Entrega original)</span>
                                                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                                                <span className="text-xs font-bold" style={{ color: r.color }}>{r.despues}</span>
                                                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: `${r.color}10`, color: r.color }}>{r.impacto}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: Cuellos de botella ── */}
                {tabActiva === "cuellos" && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-400">RF15 — Detección en tiempo real de saturación en estaciones de trabajo</p>
                        {cuellos.map(cuello => {
                            const cfg = NIVEL_CFG[cuello.nivel] || NIVEL_CFG.info;
                            const isExp = expCuello[cuello.maquina];
                            return (
                                <div key={cuello.maquina} className="rounded-xl overflow-hidden"
                                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                    <button onClick={() => setExp(p => ({ ...p, [cuello.maquina]: !p[cuello.maquina] }))}
                                        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer">
                                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                                                <span className="text-xs text-slate-400">· {cuello.maquina}</span>
                                            </div>
                                            <p className="text-sm font-medium mt-1 text-[#cbd5e1]">{cuello.msg}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xl font-black font-mono" style={{ color: cfg.color }}>{cuello.sat}%</span>
                                            <ChevronDown className="w-4 h-4 text-slate-400" style={{ transform: isExp ? "rotate(180deg)" : "none" }} />
                                        </div>
                                    </button>
                                    {isExp && (
                                        <div className="px-4 pb-4 pt-3 space-y-2 border-t" style={{ borderColor: AppColors.border }}>
                                            <div className="h-2 rounded-full" style={{ background: "#1e293b" }}>
                                                <div className="h-full rounded-full" style={{ width: `${cuello.sat}%`, background: cfg.color }} />
                                            </div>
                                            <p className="text-xs flex items-center gap-2 text-[#94a3b8]">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                Retraso acumulado proyectado: <strong className="text-white">
                                                    {cuello.impacto > 0 ? `${cuello.impacto} hrs` : "Sin impacto"}
                                                </strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── TAB: Recomendaciones ── */}
                {tabActiva === "recomendaciones" && (
                    <div className="space-y-4">
                        <p className="text-xs text-slate-400">RF15 — Balanceo asistido redistribuyendo operarios calificados hacia estaciones Merrow/Cover</p>
                        {recs.map(r => {
                            if (r.aceptada !== undefined) return (
                                <div key={r.id} className="rounded-xl border p-4 flex items-center gap-3 opacity-50"
                                    style={{ borderColor: AppColors.border }}>
                                    {r.aceptada
                                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        : <X className="w-5 h-5 text-slate-400" />}
                                    <p className="text-sm text-slate-400">
                                        {r.aceptada ? "Recomendación de balanceo aplicada" : "Recomendación ignorada"}
                                    </p>
                                </div>
                            );
                            return (
                                <div key={r.id} className="rounded-2xl overflow-hidden"
                                    style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-medium text-slate-400">Rebalanceo de Personal</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                                            style={{
                                                color: r.prioridad === "alta" ? AppColors.red : AppColors.amber,
                                                background: r.prioridad === "alta" ? `${AppColors.red}15` : `${AppColors.amber}15`,
                                                border: `1px solid ${r.prioridad === "alta" ? AppColors.red + "40" : AppColors.amber + "40"}`,
                                            }}>{r.prioridad}</span>
                                    </div>
                                    
                                    {/* Movimiento visual */}
                                    <div className="mx-4 mb-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: "#0d1018" }}>
                                        <div className="flex-1 text-center">
                                            <p className="text-[10px] mb-0.5 text-slate-500 uppercase font-bold">Origen</p>
                                            <p className="text-sm font-bold text-white uppercase">{r.origen}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{ background: `${AppColors.orange}20`, border: `1px solid ${AppColors.orange}40`, color: AppColors.orange }}>
                                                {r.empleado.split(" ").map((n: string) => n[0]).join("")}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-[10px] mb-0.5 text-slate-500 uppercase font-bold">Destino</p>
                                            <p className="text-sm font-bold text-indigo-400 uppercase">{r.destino}</p>
                                        </div>
                                    </div>
                                    <p className="px-4 font-semibold text-sm text-white">{r.empleado}</p>
                                    <p className="px-4 mt-1 text-xs text-slate-300 leading-relaxed">{r.justificacion}</p>
                                    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                        <TrendingUp className="w-4 h-4 shrink-0 text-emerald-400" />
                                        <span className="text-xs text-emerald-400">
                                            Ahorro de ciclo estimado: <strong>{r.ganancia} hrs</strong>
                                        </span>
                                    </div>
                                    <div className="flex gap-2 p-4 pt-3">
                                        <button onClick={() => rechazarRecomendacion(r.id)}
                                            className="flex-1 h-10 rounded-xl border text-xs font-semibold border-white/5 text-slate-400 hover:bg-white/5 cursor-pointer">Ignorar</button>
                                        <button onClick={() => aceptarRecomendacion(r.id)}
                                            className="flex-1 h-10 rounded-xl text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-500 cursor-pointer">Aplicar Movimiento</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── TAB: Gestión Modelo ── */}
                {tabActiva === "gestion" && <PanelGestionModelo onSuccess={loadIaData} />}

            </div>
        </div>
    );
}