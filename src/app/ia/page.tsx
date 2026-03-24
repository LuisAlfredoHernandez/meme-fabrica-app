"use client";
// ─────────────────────────────────────────────────────────────
// app/ia/page.tsx — RF12-RF16 (Predicciones) + RF19-RF22 (Gestión IA)
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
    Brain, AlertTriangle, TrendingUp, TrendingDown, Zap,
    RefreshCw, CheckCircle2, X, ArrowRight, UserCheck,
    BarChart3, Shield, Info, Clock, ChevronDown, Play,
    AlertCircle, Database, GitCompare, Bell, Lock,
} from "lucide-react";
import {
    ResponsiveContainer, ComposedChart, Area, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", sky: "#38bdf8", slate: "#475569",
};

// ── Mock datos ────────────────────────────────────────────────

const PROYECCION = [
    { d: "1/03", meta: 30, real: 26, pred: undefined },
    { d: "2/03", meta: 60, real: 58, pred: undefined },
    { d: "3/03", meta: 90, real: 82, pred: undefined },
    { d: "4/03", meta: 120, real: 114, pred: undefined },
    { d: "5/03", meta: 150, real: 143, pred: undefined },
    { d: "6/03", meta: 180, real: 169, pred: undefined },
    { d: "7/03", meta: 210, real: 204, pred: 204 },
    { d: "8/03", meta: 240, real: undefined, pred: 231 },
    { d: "9/03", meta: 270, real: undefined, pred: 259 },
    { d: "10/03", meta: 300, real: undefined, pred: 288 },
];

const CUELLOS = [
    { maquina: "MERROW-01", nivel: "critica", sat: 94, impacto: 3.5, msg: "Saturación crítica — riesgo de parada en 4 hrs." },
    { maquina: "MERROW-03", nivel: "advertencia", sat: 78, impacto: 1.2, msg: "Carga elevada. Redistribuir operarios." },
    { maquina: "DTF-01", nivel: "info", sat: 35, impacto: 0, msg: "Capacidad ociosa. Puede absorber estampado pendiente." },
];

const RECOMENDACIONES = [
    { id: "r1", empleado: "Josué Reyes", origen: "COVER-02", destino: "MERROW-01", ganancia: 2.5, prioridad: "alta", justificacion: "Subutilizado en COVER-02 (58%). Moverlo reducirá saturación crítica.", aceptada: undefined as boolean | undefined },
    { id: "r2", empleado: "Carmen Méndez", origen: "COVER-01", destino: "MERROW-03", ganancia: 1.8, prioridad: "media", justificacion: "Alta eficiencia en Merrow (88%). Optimizaría salida de joggers.", aceptada: undefined as boolean | undefined },
];

const NIVEL_CFG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
    critica: { color: C.red, bg: `${C.red}10`, border: `${C.red}35`, icon: <Zap className="w-4 h-4" />, label: "Crítico" },
    advertencia: { color: C.amber, bg: `${C.amber}10`, border: `${C.amber}35`, icon: <AlertTriangle className="w-4 h-4" />, label: "Advertencia" },
    info: { color: C.sky, bg: `${C.sky}10`, border: `${C.sky}35`, icon: <Info className="w-4 h-4" />, label: "Info" },
};

const TooltipIA = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const map: Record<string, { n: string; c: string }> = {
        meta: { n: "Meta", c: "#475569" }, real: { n: "Real", c: C.orange }, pred: { n: "Predicción IA", c: C.violet },
    };
    return (
        <div className="p-3 rounded-xl text-xs shadow-2xl" style={{ background: "#1a1d28", border: `1px solid ${C.border}` }}>
            <p className="mb-2 font-medium" style={{ color: "#64748b" }}>{label}</p>
            {payload.map((p: any) => p.value != null && map[p.dataKey] ? (
                <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
                    <span className="flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: map[p.dataKey].c }} />
                        {map[p.dataKey].n}
                    </span>
                    <span className="font-bold font-mono text-white">{p.value} pzs</span>
                </div>
            ) : null)}
        </div>
    );
};

// ── Sección: Gestión del modelo IA (RF19–RF22) ────────────────

function PanelGestionModelo() {
    const [reentrenando, setReentrena] = useState(false);
    const [fase, setFase] = useState<"idle" | "validando" | "entrenando" | "comparando" | "listo">("idle");
    const [progreso, setProgreso] = useState(0);

    const diasDesdeUltimo = 18; // mock: 18 días → cumple RF20 (mínimo 15)
    const puedeReentrenar = diasDesdeUltimo >= 15;

    const iniciarReentrenamiento = async () => {
        setReentrena(true);
        // RF20: validar datos
        setFase("validando"); setProgreso(15);
        await new Promise(r => setTimeout(r, 900));
        // Entrenamiento
        setFase("entrenando"); setProgreso(55);
        await new Promise(r => setTimeout(r, 1800));
        // RF21: comparar modelos
        setFase("comparando"); setProgreso(85);
        await new Promise(r => setTimeout(r, 900));
        setFase("listo"); setProgreso(100);
        setReentrena(false);
    };

    const FASE_LABEL: Record<string, string> = {
        idle: "Sin procesos activos", validando: "Validando datos de entrenamiento...",
        entrenando: "Entrenando modelo con datos recientes...", comparando: "Comparando con modelo actual...",
        listo: "Reentrenamiento completado",
    };

    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                <Database className="w-5 h-5" style={{ color: C.violet }} />
                <h3 className="font-bold text-white text-sm">Gestión del Modelo IA</h3>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${C.violet}20`, color: C.violet }}>RF19–RF22</span>
            </div>

            <div className="p-5 space-y-5">

                {/* Estado actual del modelo */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Modelo activo", valor: "v1.4.2", icon: <Shield className="w-4 h-4" />, color: C.emerald },
                        { label: "Precisión actual", valor: "87.3%", icon: <BarChart3 className="w-4 h-4" />, color: C.emerald },
                        { label: "Días desde último entrenamiento", valor: `${diasDesdeUltimo} días`, icon: <Clock className="w-4 h-4" />, color: diasDesdeUltimo >= 15 ? C.emerald : C.red },
                        { label: "Error promedio (MAE)", valor: "1.8 días", icon: <GitCompare className="w-4 h-4" />, color: C.amber },
                    ].map(m => (
                        <div key={m.label} className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                            <span className="mt-0.5" style={{ color: m.color }}>{m.icon}</span>
                            <div>
                                <p className="text-xs" style={{ color: C.slate }}>{m.label}</p>
                                <p className="text-base font-black font-mono mt-0.5" style={{ color: m.color }}>{m.valor}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RF20: Validación de suficiencia */}
                <div className="p-4 rounded-xl" style={{
                    background: puedeReentrenar ? "rgba(52,211,153,0.07)" : "rgba(248,113,113,0.07)",
                    border: `1px solid ${puedeReentrenar ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
                }}>
                    <div className="flex items-center gap-2 mb-1">
                        {puedeReentrenar
                            ? <CheckCircle2 className="w-4 h-4" style={{ color: C.emerald }} />
                            : <AlertCircle className="w-4 h-4" style={{ color: C.red }} />}
                        <p className="text-xs font-bold" style={{ color: puedeReentrenar ? C.emerald : C.red }}>
                            {puedeReentrenar ? "Suficiencia de datos confirmada" : "Datos insuficientes para reentrenar"}
                        </p>
                    </div>
                    <p className="text-xs ml-6" style={{ color: C.slate }}>
                        {diasDesdeUltimo} días de registros nuevos · Mínimo requerido: 15 días (RNF-09)
                    </p>
                </div>

                {/* Barra de progreso */}
                {fase !== "idle" && (
                    <div>
                        <div className="flex justify-between text-xs mb-1.5" style={{ color: C.slate }}>
                            <span>{FASE_LABEL[fase]}</span>
                            <span className="font-mono">{progreso}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${progreso}%`, background: fase === "listo" ? C.emerald : C.violet }} />
                        </div>
                    </div>
                )}

                {/* RF21: Comparativa de modelos (post entrenamiento) */}
                {fase === "listo" && (
                    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "#0d1018" }}>
                            <GitCompare className="w-4 h-4" style={{ color: C.violet }} />
                            <span className="text-xs font-bold text-white">Comparativa de modelos (RF21)</span>
                        </div>
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ background: C.surface }}>
                                    {["Métrica", "Modelo actual v1.4.2", "Nuevo modelo v1.5.0"].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left font-semibold" style={{ color: C.slate }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { metrica: "MAE (días)", actual: "1.8", nuevo: "1.5", mejor: true },
                                    { metrica: "MSE", actual: "4.2", nuevo: "3.1", mejor: true },
                                    { metrica: "Precisión", actual: "87.3%", nuevo: "89.1%", mejor: true },
                                    { metrica: "R² Score", actual: "0.84", nuevo: "0.87", mejor: true },
                                ].map((r, i) => (
                                    <tr key={r.metrica} className="border-t"
                                        style={{ borderColor: C.border, background: i % 2 === 0 ? C.bg : `${C.surface}60` }}>
                                        <td className="px-4 py-2.5 font-semibold" style={{ color: "#94a3b8" }}>{r.metrica}</td>
                                        <td className="px-4 py-2.5 font-mono" style={{ color: "#94a3b8" }}>{r.actual}</td>
                                        <td className="px-4 py-2.5">
                                            <span className="font-mono font-bold flex items-center gap-1"
                                                style={{ color: r.mejor ? C.emerald : C.red }}>
                                                {r.mejor ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {r.nuevo}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* RF22: RNF-10 — aviso de precisión */}
                        <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: C.border }}>
                            <span className="text-xs flex items-center gap-1.5" style={{ color: C.emerald }}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Nuevo modelo supera al actual — publicación permitida
                            </span>
                            <button className="h-8 px-4 rounded-lg text-xs font-bold text-white"
                                style={{ background: C.emerald }}>
                                Publicar v1.5.0
                            </button>
                        </div>
                    </div>
                )}

                {/* Botón reentrenar (RF19) */}
                <button onClick={iniciarReentrenamiento}
                    disabled={!puedeReentrenar || reentrenando}
                    className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                        background: (!puedeReentrenar || reentrenando) ? "#1e293b" : C.violet,
                        color: (!puedeReentrenar || reentrenando) ? "#475569" : "#fff",
                        cursor: (!puedeReentrenar || reentrenando) ? "not-allowed" : "pointer",
                    }}>
                    {reentrenando
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando...</>
                        : <><Play className="w-4 h-4" /> Iniciar reentrenamiento</>}
                </button>

                {/* RF22: Alerta de degradación */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)" }}>
                    <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.amber }} />
                    <div>
                        <p className="text-xs font-semibold" style={{ color: C.amber }}>Notificación de degradación activa (RF22)</p>
                        <p className="text-xs mt-0.5" style={{ color: C.slate }}>
                            El sistema alertará automáticamente si el error supera el 15% por 3 días consecutivos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Página principal ───────────────────────────────────────

export default function IAPage() {
    const [recs, setRecs] = useState(RECOMENDACIONES);
    const [tabActiva, setTab] = useState<"prediccion" | "cuellos" | "recomendaciones" | "gestion">("prediccion");
    const [expCuello, setExp] = useState<Record<string, boolean>>({});

    const aceptar = (id: string) => setRecs(r => r.map(x => x.id === id ? { ...x, aceptada: true } : x));
    const rechazar = (id: string) => setRecs(r => r.map(x => x.id === id ? { ...x, aceptada: false } : x));

    const criticas = CUELLOS.filter(c => c.nivel === "critica").length;
    const pendRecs = recs.filter(r => r.aceptada === undefined).length;

    return (
        <div className="flex-1 overflow-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: C.border, background: C.surface }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${C.violet}20`, border: `1px solid ${C.violet}40` }}>
                            <Brain className="w-5 h-5" style={{ color: C.violet }} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white">IA Predictiva</h1>
                            <p className="text-xs mt-0.5" style={{ color: C.slate }}>RF12–RF16 · RF19–RF22 — Modelo v1.4.2</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.emerald }} />
                        <span className="text-xs font-semibold text-white">Modelo activo</span>
                        <span className="text-xs font-mono" style={{ color: C.slate }}>82% confianza</span>
                    </div>
                </div>

                {/* KPIs IA */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                        { label: "Entrega estimada", valor: "17 Mar", sub: "ORD-0042", color: C.amber },
                        { label: "Eficiencia actual", valor: "76%", sub: "↑ mejorando", color: C.emerald },
                        { label: "Alertas críticas", valor: criticas, sub: "en tiempo real", color: C.red },
                        { label: "Recs. pendientes", valor: pendRecs, sub: "de personal", color: C.violet },
                    ].map(k => (
                        <div key={k.label} className="rounded-xl px-4 py-3"
                            style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                            <p className="text-xs mb-1" style={{ color: C.slate }}>{k.label}</p>
                            <p className="text-xl font-black font-mono" style={{ color: k.color }}>{k.valor}</p>
                            <p className="text-xs" style={{ color: C.slate }}>{k.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: C.border, background: C.surface }}>
                {([
                    ["prediccion", "📈 Proyección", undefined],
                    ["cuellos", "⚡ Cuellos", criticas > 0 ? String(criticas) : undefined],
                    ["recomendaciones", "👥 Personal", pendRecs > 0 ? String(pendRecs) : undefined],
                    ["gestion", "🔧 Gestión Modelo", undefined],
                ] as const).map(([id, label, badge]) => (
                    <button key={id} onClick={() => setTab(id as any)}
                        className="flex-1 py-3.5 text-xs font-semibold relative transition-all flex items-center justify-center gap-1.5"
                        style={{ color: tabActiva === id ? C.orange : "#64748b" }}>
                        {label}
                        {badge && (
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{ background: C.red, color: "#fff" }}>{badge}</span>
                        )}
                        {tabActiva === id && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: C.orange }} />}
                    </button>
                ))}
            </div>

            <div className="p-6 space-y-5">

                {/* ── TAB: Proyección ── */}
                {tabActiva === "prediccion" && (
                    <div className="space-y-5">
                        {/* Gráfica proyección */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                                <BarChart3 className="w-5 h-5" style={{ color: C.orange }} />
                                <h3 className="font-bold text-white text-sm">Proyección de producción — RF12, RF13</h3>
                            </div>
                            <div className="p-5">
                                <ResponsiveContainer width="100%" height={260}>
                                    <ComposedChart data={PROYECCION} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                        <defs>
                                            <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={C.orange} stopOpacity={0.25} />
                                                <stop offset="95%" stopColor={C.orange} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={C.violet} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                                        <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<TooltipIA />} />
                                        <Line type="monotone" dataKey="meta" stroke="#334155" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                                        <Area type="monotone" dataKey="pred" stroke={C.violet} strokeWidth={2} strokeDasharray="4 2" fill="url(#gP2)" dot={false} />
                                        <Area type="monotone" dataKey="real" stroke={C.orange} strokeWidth={2.5} fill="url(#gR2)"
                                            dot={{ fill: C.orange, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: C.orange, stroke: "#fff", strokeWidth: 2 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="px-5 pb-4 flex gap-4 text-xs" style={{ color: "#475569" }}>
                                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block" style={{ background: C.orange }} /> Real</span>
                                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: "#334155" }} /> Meta</span>
                                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: C.violet }} /> Predicción IA</span>
                            </div>
                        </div>

                        {/* RF14: Detección temprana de retrasos */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                                <AlertTriangle className="w-5 h-5" style={{ color: C.amber }} />
                                <h3 className="font-bold text-white text-sm">Detección temprana de retrasos — RF14</h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { riesgo: "alto", msg: "ORD-2026-0042: 58% completado con 7 días restantes. Alta probabilidad de incumplimiento.", color: C.red },
                                    { riesgo: "medio", msg: "ORD-2026-0043: Ritmo actual alcanzaría la meta con 2 días de margen.", color: C.amber },
                                    { riesgo: "bajo", msg: "ORD-2026-0044 (MTS): Sin fecha comprometida. Sin riesgo inmediato.", color: C.emerald },
                                ].map((r, i) => (
                                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                                        style={{ background: `${r.color}08`, border: `1px solid ${r.color}25` }}>
                                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: r.color }} />
                                        <p className="text-sm" style={{ color: "#cbd5e1" }}>{r.msg}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RF16: Simulación impacto MTS */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                                <GitCompare className="w-5 h-5" style={{ color: C.sky }} />
                                <h3 className="font-bold text-white text-sm">Simulación de impacto MTS — RF16</h3>
                            </div>
                            <div className="p-5 space-y-3">
                                <p className="text-xs" style={{ color: C.slate }}>
                                    Impacto si se agrega: <strong className="text-white">ORD-2026-0046 (Stock 120 pzs)</strong> a la cola actual
                                </p>
                                {[
                                    { orden: "ORD-2026-0042", antes: "17 Mar", despues: "17 Mar", impacto: "Sin impacto", color: C.emerald },
                                    { orden: "ORD-2026-0043", antes: "22 Mar", despues: "24 Mar", impacto: "+2 días", color: C.amber },
                                ].map(r => (
                                    <div key={r.orden} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                        style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                                        <span className="font-mono text-xs font-bold" style={{ color: C.orange }}>{r.orden}</span>
                                        <span className="text-xs" style={{ color: C.slate }}>{r.antes}</span>
                                        <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: C.slate }} />
                                        <span className="text-xs font-bold" style={{ color: r.color }}>{r.despues}</span>
                                        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: `${r.color}18`, color: r.color }}>{r.impacto}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: Cuellos de botella ── */}
                {tabActiva === "cuellos" && (
                    <div className="space-y-3">
                        <p className="text-xs" style={{ color: C.slate }}>RF15 — Detección de saturación en estaciones</p>
                        {CUELLOS.map(c => {
                            const cfg = NIVEL_CFG[c.nivel];
                            const isExp = expCuello[c.maquina];
                            return (
                                <div key={c.maquina} className="rounded-xl overflow-hidden"
                                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                    <button onClick={() => setExp(p => ({ ...p, [c.maquina]: !p[c.maquina] }))}
                                        className="w-full flex items-start gap-3 p-4 text-left">
                                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                                                <span className="text-xs" style={{ color: C.slate }}>· {c.maquina}</span>
                                            </div>
                                            <p className="text-sm font-medium mt-1" style={{ color: "#e2e8f0" }}>{c.msg}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xl font-black font-mono" style={{ color: cfg.color }}>{c.sat}%</span>
                                            <ChevronDown className="w-4 h-4" style={{ color: C.slate, transform: isExp ? "rotate(180deg)" : "none" }} />
                                        </div>
                                    </button>
                                    {isExp && (
                                        <div className="px-4 pb-4 pt-3 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
                                            <div className="h-2 rounded-full" style={{ background: "#1e293b" }}>
                                                <div className="h-full rounded-full" style={{ width: `${c.sat}%`, background: cfg.color }} />
                                            </div>
                                            <p className="text-xs flex items-center gap-2" style={{ color: "#94a3b8" }}>
                                                <Clock className="w-3.5 h-3.5" style={{ color: C.slate }} />
                                                Impacto estimado: <strong className="text-white">
                                                    {c.impacto > 0 ? `${c.impacto} hrs de retraso` : "Sin impacto inmediato"}
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
                        <p className="text-xs" style={{ color: C.slate }}>RF15 — Balanceo de línea asistido por IA</p>
                        {recs.map(r => {
                            if (r.aceptada !== undefined) return (
                                <div key={r.id} className="rounded-xl border p-4 flex items-center gap-3 opacity-50"
                                    style={{ borderColor: C.border }}>
                                    {r.aceptada
                                        ? <CheckCircle2 className="w-5 h-5" style={{ color: C.emerald }} />
                                        : <X className="w-5 h-5" style={{ color: C.slate }} />}
                                    <p className="text-sm" style={{ color: "#64748b" }}>
                                        {r.aceptada ? "Recomendación aplicada" : "Recomendación descartada"}
                                    </p>
                                </div>
                            );
                            return (
                                <div key={r.id} className="rounded-2xl overflow-hidden"
                                    style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4" style={{ color: C.slate }} />
                                            <span className="text-xs font-medium" style={{ color: C.slate }}>Movimiento de Personal</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                                            style={{
                                                color: r.prioridad === "alta" ? C.red : C.amber,
                                                background: r.prioridad === "alta" ? `${C.red}15` : `${C.amber}15`,
                                                border: `1px solid ${r.prioridad === "alta" ? C.red + "40" : C.amber + "40"}`,
                                            }}>{r.prioridad}</span>
                                    </div>
                                    {/* Movimiento visual */}
                                    <div className="mx-4 mb-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: "#0d1018" }}>
                                        <div className="flex-1 text-center">
                                            <p className="text-xs mb-0.5" style={{ color: C.slate }}>Origen</p>
                                            <p className="text-sm font-bold text-white">{r.origen}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{ background: `${C.orange}20`, border: `1px solid ${C.orange}40`, color: C.orange }}>
                                                {r.empleado.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <ArrowRight className="w-4 h-4" style={{ color: C.orange }} />
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-xs mb-0.5" style={{ color: C.slate }}>Destino</p>
                                            <p className="text-sm font-bold" style={{ color: C.amber }}>{r.destino}</p>
                                        </div>
                                    </div>
                                    <p className="px-4 font-semibold text-sm text-white">{r.empleado}</p>
                                    <p className="px-4 mt-1 text-sm" style={{ color: "#94a3b8" }}>{r.justificacion}</p>
                                    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
                                        style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                                        <TrendingUp className="w-4 h-4 shrink-0" style={{ color: C.emerald }} />
                                        <span className="text-xs" style={{ color: C.emerald }}>
                                            Ahorro estimado: <strong>{r.ganancia} hrs</strong>
                                        </span>
                                    </div>
                                    <div className="flex gap-2 p-4 pt-3">
                                        <button onClick={() => rechazar(r.id)}
                                            className="flex-1 h-11 rounded-xl border text-sm font-semibold"
                                            style={{ borderColor: C.border, color: "#94a3b8" }}>Ignorar</button>
                                        <button onClick={() => aceptar(r.id)}
                                            className="flex-1 h-11 rounded-xl text-white text-sm font-bold"
                                            style={{ background: C.orange }}>Aplicar</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── TAB: Gestión Modelo ── */}
                {tabActiva === "gestion" && <PanelGestionModelo />}

            </div>
        </div>
    );
}