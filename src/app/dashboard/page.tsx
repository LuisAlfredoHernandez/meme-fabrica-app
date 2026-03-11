"use client";

import { useState, useMemo } from "react";
import {
    ResponsiveContainer, ComposedChart, Area, Line, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts";
import {
    Brain, AlertTriangle, ArrowRight, UserCheck, Clock, Zap,
    CheckCheck, X, ChevronDown, Activity, Shield, RefreshCw,
    Info, TrendingUp, Scissors, Layers, Printer, Package,
    BarChart3, CheckCircle2, RotateCcw, ChevronRight, Loader2,
    AlertCircle, Calendar, Minus, TrendingDown
} from "lucide-react";

// ── Mock Data ────────────────────────────────────────────────

const MOCK_ORDENES = [
    { id: "o1", numero: "ORD-2026-0042", cliente: "Boutique Bella", totalPiezas: 150, totalCompletadas: 87, estado: "en_proceso", prioridad: "alta", temporada: "alta", fechaEntregaEstimada: "2026-03-18", lineas: [], fechaCreacion: "", creadaPor: "" },
    { id: "o2", numero: "ORD-2026-0043", cliente: "ModaRD Store", totalPiezas: 200, totalCompletadas: 34, estado: "en_proceso", prioridad: "normal", temporada: "alta", fechaEntregaEstimada: "2026-03-22", lineas: [], fechaCreacion: "", creadaPor: "" },
];

const MOCK_MAQUINAS = [
    { id: "m1", codigo: "MERROW-01", tipo: "merrow", nombre: "Merrow Industrial #1", capacidadPorHora: 45, estado: "activa", horasUso: 1240 },
    { id: "m2", codigo: "MERROW-02", tipo: "merrow", nombre: "Merrow Industrial #2", capacidadPorHora: 45, estado: "activa", horasUso: 980 },
    { id: "m3", codigo: "MERROW-03", tipo: "merrow", nombre: "Merrow Industrial #3", capacidadPorHora: 42, estado: "activa", horasUso: 1550 },
    { id: "m4", codigo: "COVER-01", tipo: "cover", nombre: "Cover #1", capacidadPorHora: 38, estado: "activa", horasUso: 860 },
    { id: "m5", codigo: "COVER-02", tipo: "cover", nombre: "Cover #2", capacidadPorHora: 38, estado: "activa", horasUso: 720 },
    { id: "m6", codigo: "PLANA-01", tipo: "plana", nombre: "Plana #1", capacidadPorHora: 30, estado: "activa", horasUso: 640 },
    { id: "m7", codigo: "CORTE-01", tipo: "corte", nombre: "Cortadora #1", capacidadPorHora: 60, estado: "activa", horasUso: 900 },
    { id: "m8", codigo: "CORTE-02", tipo: "corte", nombre: "Cortadora #2", capacidadPorHora: 55, estado: "activa", horasUso: 750 },
    { id: "m9", codigo: "DTF-01", tipo: "plancha_dtf", nombre: "Plancha DTF #1", capacidadPorHora: 25, estado: "activa", horasUso: 420 },
    { id: "m10", codigo: "DTF-02", tipo: "plancha_dtf", nombre: "Plancha DTF #2", capacidadPorHora: 25, estado: "activa", horasUso: 380 },
    { id: "m11", codigo: "PESO-01", tipo: "peso", nombre: "Báscula #1", capacidadPorHora: 80, estado: "activa", horasUso: 300 },
];

const MOCK_EMPLEADOS = [
    { id: "e1", nombre: "Carmen", apellido: "Méndez", rol: "operario", maquinasHabilitadas: ["merrow", "cover"], etapasEspecializacion: ["confeccion"], eficienciaPromedio: 88, activo: true, fechaIngreso: "2023-01-15" },
    { id: "e2", nombre: "Josué", apellido: "Reyes", rol: "operario", maquinasHabilitadas: ["cover", "plana"], etapasEspecializacion: ["confeccion"], eficienciaPromedio: 74, activo: true, fechaIngreso: "2024-03-01" },
    { id: "e3", nombre: "María", apellido: "Santos", rol: "operario", maquinasHabilitadas: ["corte"], etapasEspecializacion: ["corte"], eficienciaPromedio: 91, activo: true, fechaIngreso: "2022-08-10" },
];

const MOCK_PREDICCION = {
    id: "pred-001",
    ordenId: "o1",
    modelVersion: "v1.4.2",
    fechaGeneracion: new Date().toISOString(),
    fechaFinalizacionEstimada: "2026-03-17T18:00:00",
    confianza: 0.82,
    diasRestantesEstimados: 7,
    eficienciaActual: 76,
    tendenciaEficiencia: "mejorando",
    metaProduccionDiaria: 30,
    produccionRealHoy: 24,
    cuellosBotella: [
        { maquinaId: "m1", tipo: "merrow", nivel: "critica", mensaje: "MERROW-01 operando al 94% — riesgo de parada técnica en las próximas 4 horas.", saturationPct: 94, impactoEstimadoHoras: 3.5, timestamp: new Date().toISOString() },
        { maquinaId: "m3", tipo: "merrow", nivel: "advertencia", mensaje: "MERROW-03 acumula retraso por alta demanda. Se recomienda redistribuir carga.", saturationPct: 78, impactoEstimadoHoras: 1.2, timestamp: new Date().toISOString() },
        { maquinaId: "m9", tipo: "plancha_dtf", nivel: "info", mensaje: "DTF-01 con baja utilización. Puede absorber parte del estampado pendiente.", saturationPct: 35, impactoEstimadoHoras: 0, timestamp: new Date().toISOString() },
    ],
    recomendaciones: [
        { id: "r1", tipo: "movimiento", empleadoId: "e2", maquinaOrigenId: "m5", maquinaDestinoId: "m1", etapaOrigen: "confeccion", etapaDestino: "confeccion", justificacion: "Josué Reyes está subutilizado en COVER-02 (58%). Moverlo a MERROW-01 reduciría la carga crítica y cubriría el déficit de 6 piezas/hr.", gananciaTiempoEstimadaHoras: 2.5, prioridad: "alta", timestamp: new Date().toISOString() },
        { id: "r2", tipo: "reasignacion", empleadoId: "e1", maquinaOrigenId: "m4", maquinaDestinoId: "m3", etapaOrigen: "confeccion", etapaDestino: "confeccion", justificacion: "Carmen Méndez tiene alta eficiencia en Merrow (88%). Reasignarla a MERROW-03 optimizaría la salida de la línea de joggers.", gananciaTiempoEstimadaHoras: 1.8, prioridad: "media", timestamp: new Date().toISOString() },
    ],
    factoresRiesgo: [
        "Inventario de tela micro por debajo del mínimo — riesgo de parada por falta de insumos en ~2 días.",
        "3 de los últimos 5 registros muestran más del 8% de piezas defectuosas en MERROW-03.",
        "La orden ORD-2026-0042 tiene fecha de entrega en 7 días con solo 58% de avance.",
    ],
    proyeccionDiaria: [],
};

const MOCK_GRAFICA = [
    { fecha: "1/03", meta: 30, real: 26, prediccion: undefined, eficiencia: 87 },
    { fecha: "2/03", meta: 60, real: 58, prediccion: undefined, eficiencia: 90 },
    { fecha: "3/03", meta: 90, real: 82, prediccion: undefined, eficiencia: 85 },
    { fecha: "4/03", meta: 120, real: 114, prediccion: undefined, eficiencia: 88 },
    { fecha: "5/03", meta: 150, real: 143, prediccion: undefined, eficiencia: 91 },
    { fecha: "6/03", meta: 180, real: 169, prediccion: undefined, eficiencia: 89 },
    { fecha: "7/03", meta: 210, real: 204, prediccion: 204, eficiencia: 95 },
    { fecha: "8/03", meta: 240, real: undefined, prediccion: 231, eficiencia: 0 },
    { fecha: "9/03", meta: 270, real: undefined, prediccion: 259, eficiencia: 0 },
    { fecha: "10/03", meta: 300, real: undefined, prediccion: 288, eficiencia: 0 },
];

// ── Colores constantes ───────────────────────────────────────
const C = {
    bg: "#0f1117",
    surface: "#13161e",
    border: "#1e2130",
    orange: "#f97316",
    violet: "#818cf8",
    emerald: "#34d399",
    amber: "#fbbf24",
    red: "#f87171",
    sky: "#38bdf8",
};

// ── Tabs de navegación ───────────────────────────────────────
const TABS = [
    { id: "form", label: "📝 Registrar" },
    { id: "grafica", label: "📊 Eficiencia" },
    { id: "panel", label: "🧠 IA Predictiva" },
];

// ════════════════════════════════════════════════════════════
// FORMULARIO DE REGISTRO (inline demo)
// ════════════════════════════════════════════════════════════

const ETAPAS_FORM = [
    { valor: "corte", label: "Corte", desc: "Corte de tela", icon: <Scissors className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/40" },
    { valor: "confeccion", label: "Confección", desc: "Costura y ensamble", icon: <Layers className="w-5 h-5" />, color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/40" },
    { valor: "estampado", label: "Estampado", desc: "DTF / serigrafía", icon: <Printer className="w-5 h-5" />, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/40" },
    { valor: "acabado", label: "Acabado", desc: "Revisión y empaque", icon: <Package className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/40" },
];

const MAQUINAS_POR_ETAPA = {
    corte: ["m7", "m8"],
    confeccion: ["m1", "m2", "m3", "m4", "m5", "m6"],
    estampado: ["m9", "m10"],
    acabado: ["m9", "m10", "m11"],
};

function FormularioDemo() {
    const [paso, setPaso] = useState(1);
    const [form, setForm] = useState({ ordenId: "", etapa: "", maquinaId: "", horaInicio: "08:00", horaFin: "", piezas: "", defectuosas: "0", parada: "0", obs: "" });
    const [exito, setExito] = useState(false);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const maqsFiltradas = form.etapa ? MOCK_MAQUINAS.filter(m => (MAQUINAS_POR_ETAPA[form.etapa] || []).includes(m.id)) : [];
    const ordenSel = MOCK_ORDENES.find(o => o.id === form.ordenId);
    const maqSel = MOCK_MAQUINAS.find(m => m.id === form.maquinaId);

    const eficiencia = (() => {
        if (!maqSel || !form.horaInicio || !form.horaFin || !form.piezas) return null;
        const [hI, mI] = form.horaInicio.split(":").map(Number);
        const [hF, mF] = form.horaFin.split(":").map(Number);
        const horas = (hF * 60 + mF - (hI * 60 + mI)) / 60;
        const ef = Math.round((parseInt(form.piezas) / (maqSel.capacidadPorHora * horas)) * 100);
        return isNaN(ef) ? null : Math.min(ef, 150);
    })();

    const handleEnviar = () => {
        setExito(true);
        setTimeout(() => { setExito(false); setPaso(1); setForm({ ordenId: "", etapa: "", maquinaId: "", horaInicio: "08:00", horaFin: "", piezas: "", defectuosas: "0", parada: "0", obs: "" }); }, 2200);
    };

    if (exito) return (
        <div className="min-h-96 flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-500/30" style={{ background: C.bg }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(52,211,153,0.15)" }}>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white">¡Registro guardado!</p>
            <p className="text-sm" style={{ color: "#64748b" }}>La producción fue registrada exitosamente.</p>
        </div>
    );

    return (
        <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ background: C.bg, borderColor: C.border }}>
            {/* Header */}
            <div className="px-6 py-5 border-b" style={{ background: C.surface, borderColor: C.border }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-white">Registrar Producción</h2>
                        <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Completa los datos de tu turno</p>
                    </div>
                    <button onClick={() => { setPaso(1); setForm({ ordenId: "", etapa: "", maquinaId: "", horaInicio: "08:00", horaFin: "", piezas: "", defectuosas: "0", parada: "0", obs: "" }); }} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: "#64748b" }}>
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
                {/* Steps */}
                <div className="flex items-center gap-2 mt-5">
                    {[{ n: 1, l: "Tarea" }, { n: 2, l: "Horario" }, { n: 3, l: "Producción" }].map(({ n, l }, i) => (
                        <div key={n} className="flex items-center gap-2 flex-1">
                            <div className={`flex items-center gap-1.5 flex-1 ${paso >= n ? "opacity-100" : "opacity-30"}`}>
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                                    style={{ background: paso > n ? C.emerald : paso === n ? C.orange : "#334155", color: "#fff", boxShadow: paso === n ? `0 0 0 4px ${C.orange}33` : "none" }}>
                                    {paso > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                                </div>
                                <span className="text-xs font-medium hidden sm:block" style={{ color: paso === n ? C.orange : paso > n ? C.emerald : "#475569" }}>{l}</span>
                            </div>
                            {i < 2 && <div className="h-0.5 flex-1 mx-1 rounded" style={{ background: paso > n ? C.emerald : C.border }} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-5">
                {paso === 1 && (
                    <>
                        {/* Orden */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Orden de Producción</label>
                            <select value={form.ordenId} onChange={e => set("ordenId", e.target.value)}
                                className="w-full h-12 px-3 rounded-xl text-sm text-white appearance-none cursor-pointer focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.ordenId ? C.orange : C.border}` }}>
                                <option value="">— Selecciona una orden —</option>
                                {MOCK_ORDENES.map(o => <option key={o.id} value={o.id}>{o.numero} · {o.cliente}</option>)}
                            </select>
                            {ordenSel && (
                                <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                                                <div className="h-full rounded-full" style={{ background: C.orange, width: `${Math.round((ordenSel.totalCompletadas / ordenSel.totalPiezas) * 100)}%` }} />
                                            </div>
                                            <span className="text-xs font-mono" style={{ color: C.orange }}>{ordenSel.totalCompletadas}/{ordenSel.totalPiezas}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Etapas */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Etapa</label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {ETAPAS_FORM.map(e => (
                                    <button key={e.valor} onClick={() => { set("etapa", e.valor); set("maquinaId", ""); }}
                                        className="flex items-center gap-2.5 p-3.5 rounded-xl border-2 text-left transition-all"
                                        style={{ background: form.etapa === e.valor ? "rgba(249,115,22,0.08)" : "#0d1018", borderColor: form.etapa === e.valor ? C.orange : C.border }}>
                                        <span style={{ color: form.etapa === e.valor ? C.orange : "#475569" }}>{e.icon}</span>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: form.etapa === e.valor ? "#fff" : "#94a3b8" }}>{e.label}</p>
                                            <p className="text-xs" style={{ color: "#475569" }}>{e.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Máquinas */}
                        {form.etapa && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Máquina</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {maqsFiltradas.map(m => (
                                        <button key={m.id} onClick={() => set("maquinaId", m.id)}
                                            className="p-3 rounded-xl border-2 text-left transition-all"
                                            style={{ background: form.maquinaId === m.id ? "rgba(249,115,22,0.08)" : "#0d1018", borderColor: form.maquinaId === m.id ? C.orange : C.border }}>
                                            <p className="text-sm font-bold" style={{ color: form.maquinaId === m.id ? C.orange : "#e2e8f0" }}>{m.codigo}</p>
                                            <p className="text-xs" style={{ color: "#475569" }}>~{m.capacidadPorHora} pzs/hr</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {paso === 2 && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            {[{ k: "horaInicio", l: "Hora Inicio" }, { k: "horaFin", l: "Hora Fin" }].map(({ k, l }) => (
                                <div key={k} className="space-y-1.5">
                                    <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                                        <Clock className="w-3.5 h-3.5" /> {l}
                                    </label>
                                    <input type="time" value={form[k]} onChange={e => set(k, e.target.value)}
                                        className="w-full h-14 px-3 rounded-xl text-white text-lg font-mono text-center focus:outline-none"
                                        style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }} />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Tiempo de Parada</label>
                            <div className="flex flex-wrap gap-2">
                                {[0, 5, 10, 15, 30, 60].map(m => (
                                    <button key={m} onClick={() => set("parada", String(m))}
                                        className="px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                        style={{ background: form.parada === String(m) ? C.orange : "#1e293b", color: form.parada === String(m) ? "#fff" : "#94a3b8" }}>
                                        {m} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {paso === 3 && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            {[{ k: "piezas", l: "Piezas Producidas", accent: C.orange }, { k: "defectuosas", l: "Defectuosas", accent: C.red }].map(({ k, l, accent }) => (
                                <div key={k} className="space-y-1.5">
                                    <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>{l}</label>
                                    <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0"
                                        className="w-full h-16 px-3 rounded-xl text-white text-2xl font-bold text-center focus:outline-none"
                                        style={{ background: "#0d1018", border: `1.5px solid ${form[k] ? accent : C.border}` }} />
                                </div>
                            ))}
                        </div>

                        {eficiencia !== null && (
                            <div className="p-4 rounded-xl" style={{ background: eficiencia >= 90 ? "rgba(52,211,153,0.08)" : eficiencia >= 70 ? "rgba(251,191,36,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${eficiencia >= 90 ? "rgba(52,211,153,0.25)" : eficiencia >= 70 ? "rgba(251,191,36,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                                <p className="text-xs mb-1" style={{ color: "#64748b" }}>Eficiencia estimada del turno</p>
                                <p className="text-4xl font-black" style={{ color: eficiencia >= 90 ? C.emerald : eficiencia >= 70 ? C.amber : C.red }}>{eficiencia}%</p>
                                <div className="mt-2 h-2 rounded-full" style={{ background: "#1e293b" }}>
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(eficiencia, 100)}%`, background: eficiencia >= 90 ? C.emerald : eficiencia >= 70 ? C.amber : C.red }} />
                                </div>
                            </div>
                        )}

                        <textarea placeholder="Observaciones opcionales..." value={form.obs} onChange={e => set("obs", e.target.value)} rows={2}
                            className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none resize-none placeholder-slate-600"
                            style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }} />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setPaso(p => Math.max(1, p - 1))}
                    className="h-12 px-5 rounded-xl border text-sm font-semibold transition-all"
                    style={{ borderColor: C.border, color: "#94a3b8" }}>
                    {paso === 1 ? "Cancelar" : "Atrás"}
                </button>
                {paso < 3 ? (
                    <button onClick={() => setPaso(p => p + 1)}
                        className="flex-1 h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all"
                        style={{ background: C.orange }}>
                        Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={handleEnviar}
                        className="flex-1 h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all"
                        style={{ background: C.emerald }}>
                        <CheckCircle2 className="w-4 h-4" /> Guardar Registro
                    </button>
                )}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// GRÁFICA EFICIENCIA (inline demo)
// ════════════════════════════════════════════════════════════

const TooltipGrafica = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const map = { real: { n: "Real", c: C.orange }, meta: { n: "Meta", c: "#475569" }, prediccion: { n: "Predicción IA", c: C.violet }, eficiencia: { n: "Eficiencia", c: C.emerald } };
    return (
        <div className="p-3 rounded-xl shadow-2xl text-xs" style={{ background: "#1a1d28", border: `1px solid ${C.border}`, minWidth: 150 }}>
            <p className="mb-2 font-medium" style={{ color: "#64748b" }}>{label}</p>
            {payload.map(p => p.value != null && map[p.dataKey] ? (
                <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: map[p.dataKey].c }} />
                        <span style={{ color: "#94a3b8" }}>{map[p.dataKey].n}</span>
                    </div>
                    <span className="font-bold font-mono text-white">{p.value}{p.dataKey === "eficiencia" ? "%" : " pzs"}</span>
                </div>
            ) : null)}
        </div>
    );
};

function GraficaDemo() {
    const [vista, setVista] = useState("acumulado");
    const datos = MOCK_GRAFICA;
    const ultimo = datos[datos.findIndex(d => !d.real || d.real === 0) - 1] || datos[6];
    const diferencia = ultimo ? ultimo.real - ultimo.meta : 0;
    const efProm = Math.round(datos.filter(d => d.eficiencia > 0).reduce((a, d) => a + d.eficiencia, 0) / datos.filter(d => d.eficiencia > 0).length);

    return (
        <div className="rounded-2xl border overflow-hidden" style={{ background: C.bg, borderColor: C.border }}>
            <div className="px-6 py-5 border-b" style={{ background: C.surface, borderColor: C.border }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" style={{ color: C.orange }} />
                        <div>
                            <h3 className="text-sm font-bold text-white">Producción vs Meta</h3>
                            <p className="text-xs" style={{ color: "#475569" }}>Orden ORD-2026-0042</p>
                        </div>
                    </div>
                    <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#0d1018" }}>
                        {[["acumulado", "Acum."], ["diario", "Diario"], ["eficiencia", "Efic."]].map(([v, l]) => (
                            <button key={v} onClick={() => setVista(v)} className="px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all"
                                style={{ background: vista === v ? C.orange : "transparent", color: vista === v ? "#fff" : "#64748b" }}>{l}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 border-b divide-x" style={{ borderColor: C.border, divideColor: C.border }}>
                {[
                    { l: "Total producido", v: (ultimo?.real || 0).toLocaleString(), s: "pzs", c: "#fff" },
                    { l: "vs Meta", v: (diferencia >= 0 ? "+" : "") + diferencia, s: "pzs", c: diferencia >= 0 ? C.emerald : C.red },
                    { l: "Eficiencia prom.", v: `${efProm}%`, s: efProm >= 90 ? "↑ Excelente" : efProm >= 70 ? "→ Aceptable" : "↓ Baja", c: efProm >= 90 ? C.emerald : efProm >= 70 ? C.amber : C.red },
                ].map(({ l, v, s, c }) => (
                    <div key={l} className="px-4 py-3.5" style={{ borderColor: C.border }}>
                        <p className="text-xs mb-1" style={{ color: "#475569" }}>{l}</p>
                        <p className="text-2xl font-black font-mono" style={{ color: c }}>{v}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{s}</p>
                    </div>
                ))}
            </div>

            {/* Progress */}
            <div className="px-6 py-3 border-b" style={{ background: C.surface, borderColor: C.border }}>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: "#475569" }}>
                    <span>Progreso hacia meta (150 pzs)</span>
                    <span style={{ color: C.orange }}>{Math.round(((ultimo?.real || 0) / 150) * 100)}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(Math.round(((ultimo?.real || 0) / 150) * 100), 100)}%`, background: `linear-gradient(to right, #ea580c, ${C.orange})` }} />
                </div>
            </div>

            <div className="p-6">
                <ResponsiveContainer width="100%" height={240}>
                    {vista === "eficiencia" ? (
                        <ComposedChart data={datos.filter(d => d.eficiencia > 0)} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                            <XAxis dataKey="fecha" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 120]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip content={<TooltipGrafica />} />
                            <ReferenceLine y={100} stroke={C.orange} strokeDasharray="4 3" strokeOpacity={0.4} />
                            <Bar dataKey="eficiencia" fill={C.orange} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                        </ComposedChart>
                    ) : (
                        <ComposedChart data={datos} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                            <defs>
                                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={C.orange} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={C.orange} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={C.violet} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                            <XAxis dataKey="fecha" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<TooltipGrafica />} />
                            <Line type="monotone" dataKey="meta" stroke="#334155" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                            <Area type="monotone" dataKey="prediccion" stroke={C.violet} strokeWidth={1.5} strokeDasharray="4 2" fill="url(#gP)" dot={false} />
                            <Area type="monotone" dataKey="real" stroke={C.orange} strokeWidth={2.5} fill="url(#gR)" dot={{ fill: C.orange, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: C.orange, stroke: "#fff", strokeWidth: 2 }} />
                        </ComposedChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="px-6 pb-4 flex flex-wrap gap-4 text-xs" style={{ color: "#475569" }}>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block" style={{ background: C.orange }} /> Producción real</span>
                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: "#334155" }} /> Meta proyectada</span>
                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: C.violet }} /> Predicción IA</span>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// PANEL RECOMENDACIONES (inline demo)
// ════════════════════════════════════════════════════════════

function PanelDemo() {
    const [tab, setTab] = useState("alertas");
    const [recs, setRecs] = useState(MOCK_PREDICCION.recomendaciones);
    const [expanded, setExpanded] = useState({});

    const aceptar = id => setRecs(r => r.map(x => x.id === id ? { ...x, aceptada: true } : x));
    const rechazar = id => setRecs(r => r.map(x => x.id === id ? { ...x, aceptada: false } : x));

    const pendientes = recs.filter(r => r.aceptada === undefined).length;
    const criticas = MOCK_PREDICCION.cuellosBotella.filter(c => c.nivel === "critica").length;

    const diasLeft = Math.ceil((new Date(MOCK_PREDICCION.fechaFinalizacionEstimada) - new Date()) / 86400000);

    const nivelCfg = {
        critica: { c: C.red, bg: "rgba(248,113,113,0.08)", b: "rgba(248,113,113,0.3)", i: <Zap className="w-4 h-4" />, l: "Crítico" },
        advertencia: { c: C.amber, bg: "rgba(251,191,36,0.08)", b: "rgba(251,191,36,0.3)", i: <AlertTriangle className="w-4 h-4" />, l: "Advertencia" },
        info: { c: C.sky, bg: "rgba(56,189,248,0.08)", b: "rgba(56,189,248,0.3)", i: <Info className="w-4 h-4" />, l: "Info" },
    };

    return (
        <div className="rounded-2xl border overflow-hidden" style={{ background: C.bg, borderColor: C.border }}>
            {/* Header */}
            <div className="px-5 py-4 border-b" style={{ background: C.surface, borderColor: C.border }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)" }}>
                            <Brain className="w-5 h-5" style={{ color: C.violet }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Panel de IA Predictiva</h3>
                            <p className="text-xs" style={{ color: "#475569" }}>Modelo v1.4.2 · {new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                    </div>
                    <button className="p-1.5 rounded-lg" style={{ color: "#475569" }}><RefreshCw className="w-4 h-4" /></button>
                </div>
                {/* Confianza */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "#475569" }}>
                        <span>Confianza del modelo</span>
                        <span style={{ color: "#e2e8f0" }}>82%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                        <div className="h-full rounded-full" style={{ width: "82%", background: C.violet }} />
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 border-b divide-x" style={{ borderColor: C.border }}>
                <div className="px-5 py-4" style={{ borderColor: C.border }}>
                    <p className="text-xs mb-1" style={{ color: "#475569" }}>Entrega estimada</p>
                    <p className="text-3xl font-black font-mono" style={{ color: diasLeft < 3 ? C.red : diasLeft < 7 ? C.amber : "#fff" }}>{diasLeft}d</p>
                    <p className="text-xs" style={{ color: "#475569" }}>17 Mar 2026</p>
                </div>
                <div className="px-5 py-4">
                    <p className="text-xs mb-1" style={{ color: "#475569" }}>Eficiencia actual</p>
                    <p className="text-3xl font-black font-mono" style={{ color: C.amber }}>76%</p>
                    <p className="text-xs" style={{ color: C.emerald }}>↑ Mejorando</p>
                </div>
            </div>

            {/* Meta hoy */}
            <div className="px-5 py-3 border-b" style={{ background: "rgba(255,255,255,0.02)", borderColor: C.border }}>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: "#475569" }}>
                    <span>Hoy: 24 pzs producidas</span><span>Meta: 30 pzs</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#1e293b" }}>
                    <div className="h-full rounded-full" style={{ width: "80%", background: C.orange }} />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: C.border }}>
                {[["alertas", "Cuellos de Botella", 3, true], ["personal", "Personal", pendientes, false], ["riesgos", "Riesgos", 3, false]].map(([id, l, cnt, urg]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className="flex-1 py-3.5 text-xs font-semibold relative transition-all"
                        style={{ color: tab === id ? C.orange : "#475569", borderBottom: tab === id ? `2px solid ${C.orange}` : "none" }}>
                        {l}
                        {cnt > 0 && <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                            style={{ background: urg ? C.red : tab === id ? "rgba(249,115,22,0.25)" : "#1e293b", color: urg ? "#fff" : tab === id ? C.orange : "#64748b" }}>{cnt}</span>}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 420 }}>
                {tab === "alertas" && MOCK_PREDICCION.cuellosBotella.sort((a, b) => ({ critica: 0, advertencia: 1, info: 2 }[a.nivel] - { critica: 0, advertencia: 1, info: 2 }[b.nivel])).map(alerta => {
                    const cfg = nivelCfg[alerta.nivel];
                    const maq = MOCK_MAQUINAS.find(m => m.id === alerta.maquinaId);
                    const isExp = expanded[alerta.maquinaId];
                    return (
                        <div key={alerta.maquinaId} className="rounded-xl overflow-hidden" style={{ background: cfg.bg, border: `1px solid ${cfg.b}` }}>
                            <button onClick={() => setExpanded(p => ({ ...p, [alerta.maquinaId]: !p[alerta.maquinaId] }))}
                                className="w-full flex items-start gap-3 p-4 text-left">
                                <span style={{ color: cfg.c }}>{cfg.i}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase" style={{ color: cfg.c }}>{cfg.l}</span>
                                        <span className="text-xs" style={{ color: "#475569" }}>· {maq?.codigo}</span>
                                    </div>
                                    <p className="text-sm font-medium mt-1" style={{ color: "#e2e8f0" }}>{alerta.mensaje}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-lg font-black font-mono" style={{ color: alerta.saturationPct >= 90 ? C.red : alerta.saturationPct >= 70 ? C.amber : C.sky }}>{alerta.saturationPct}%</span>
                                    <ChevronDown className="w-4 h-4" style={{ color: "#475569", transform: isExp ? "rotate(180deg)" : "none" }} />
                                </div>
                            </button>
                            {isExp && (
                                <div className="px-4 pb-4 pt-3 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
                                    <div className="flex justify-between text-xs mb-1" style={{ color: "#475569" }}>
                                        <span>Saturación</span><span>{alerta.saturationPct}%</span>
                                    </div>
                                    <div className="h-2 rounded-full" style={{ background: "#1e293b" }}>
                                        <div className="h-full rounded-full" style={{ width: `${alerta.saturationPct}%`, background: alerta.saturationPct >= 90 ? C.red : C.amber }} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                                        <Clock className="w-3.5 h-3.5" style={{ color: "#475569" }} />
                                        Impacto estimado: <span className="font-semibold text-white">{alerta.impactoEstimadoHoras > 0 ? `${alerta.impactoEstimadoHoras} hrs de retraso` : "Sin impacto inmediato"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {tab === "personal" && recs.map(rec => {
                    const emp = MOCK_EMPLEADOS.find(e => e.id === rec.empleadoId);
                    const maqO = MOCK_MAQUINAS.find(m => m.id === rec.maquinaOrigenId);
                    const maqD = MOCK_MAQUINAS.find(m => m.id === rec.maquinaDestinoId);
                    if (rec.aceptada !== undefined) return (
                        <div key={rec.id} className="rounded-xl border p-4 flex items-center gap-3 opacity-50" style={{ borderColor: C.border, background: "#0d1018" }}>
                            {rec.aceptada ? <CheckCheck className="w-5 h-5" style={{ color: C.emerald }} /> : <X className="w-5 h-5" style={{ color: "#475569" }} />}
                            <p className="text-sm" style={{ color: "#64748b" }}>{rec.aceptada ? "Recomendación aplicada" : "Recomendación descartada"}</p>
                        </div>
                    );
                    return (
                        <div key={rec.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)" }}>
                            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4" style={{ color: "#64748b" }} />
                                    <span className="text-xs font-medium" style={{ color: "#64748b" }}>Movimiento de Personal</span>
                                </div>
                                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full" style={{ color: C.red, background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.3)` }}>Alta</span>
                            </div>
                            {/* Movimiento visual */}
                            <div className="mx-4 mb-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: "#0d1018" }}>
                                <div className="flex-1 text-center">
                                    <p className="text-xs mb-0.5" style={{ color: "#475569" }}>Origen</p>
                                    <p className="text-sm font-bold text-white">{maqO?.codigo ?? "—"}</p>
                                    <p className="text-xs" style={{ color: "#475569" }}>{maqO?.tipo?.toUpperCase()}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: "rgba(249,115,22,0.15)", border: `1px solid rgba(249,115,22,0.35)`, color: C.orange }}>
                                        {emp ? `${emp.nombre[0]}${emp.apellido[0]}` : "?"}
                                    </div>
                                    <ArrowRight className="w-4 h-4" style={{ color: C.orange }} />
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-xs mb-0.5" style={{ color: "#475569" }}>Destino</p>
                                    <p className="text-sm font-bold" style={{ color: C.amber }}>{maqD?.codigo ?? "—"}</p>
                                    <p className="text-xs" style={{ color: "#475569" }}>{maqD?.tipo?.toUpperCase()}</p>
                                </div>
                            </div>
                            <p className="px-4 font-semibold text-sm text-white">{emp?.nombre} {emp?.apellido}</p>
                            <p className="px-4 mt-1 text-sm" style={{ color: "#94a3b8" }}>{rec.justificacion}</p>
                            <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                                <TrendingUp className="w-4 h-4 shrink-0" style={{ color: C.emerald }} />
                                <span className="text-xs" style={{ color: C.emerald }}>Ahorro estimado: <strong>{rec.gananciaTiempoEstimadaHoras} hrs</strong></span>
                            </div>
                            <div className="flex gap-2 p-4 pt-3">
                                <button onClick={() => rechazar(rec.id)} className="flex-1 h-11 rounded-xl border text-sm font-semibold transition-all" style={{ borderColor: C.border, color: "#94a3b8" }}>Ignorar</button>
                                <button onClick={() => aceptar(rec.id)} className="flex-1 h-11 rounded-xl text-white text-sm font-bold transition-all" style={{ background: C.orange }}>Aplicar</button>
                            </div>
                        </div>
                    );
                })}

                {tab === "riesgos" && MOCK_PREDICCION.factoresRiesgo.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: "rgba(251,191,36,0.05)", border: `1px solid rgba(251,191,36,0.2)` }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.amber }} />
                        <p className="text-sm" style={{ color: "#cbd5e1" }}>{r}</p>
                    </div>
                ))}
            </div>

            <div className="px-5 py-3 border-t flex items-center justify-between" style={{ background: C.surface, borderColor: C.border }}>
                <span className="text-xs" style={{ color: "#334155" }}>Powered by Scikit-learn · v1.4.2</span>
                <span className="text-xs" style={{ color: "#334155" }}>Actualizado {new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// TYPES DISPLAY
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════

export default function App() {
    const [tabActiva, setTabActiva] = useState("form");
    const fecha = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "2-digit", month: "long" });
    const hora = new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });

    const KPI = [
        { label: "Órdenes activas", valor: "2", sub: "en producción", color: C.orange, dot: true },
        { label: "Piezas hoy", valor: "204", sub: "meta: 240 pzs", color: C.emerald, dot: false },
        { label: "Eficiencia global", valor: "95%", sub: "↑ mejorando", color: C.emerald, dot: false },
        { label: "Alertas IA", valor: "1", sub: "crítica activa", color: C.red, dot: true },
    ];

    return (
        <div className="w-full min-h-screen" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* ── Header fijo ── */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ background: C.surface, borderColor: C.border }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black"
                        style={{ background: C.orange, boxShadow: `0 4px 14px ${C.orange}40` }}>M</div>
                    <div>
                        <h1 className="text-base font-black text-white leading-none tracking-tight">Meme Fábricas</h1>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Sistema de Control de Producción · IA</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-sm font-semibold text-white capitalize">{fecha}</p>
                    <p className="text-xs font-mono" style={{ color: "#475569" }}>{hora} · Santo Domingo, RD</p>
                </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-4 border-b" style={{ borderColor: C.border }}>
                {KPI.map(({ label, valor, sub, color, dot }, i) => (
                    <div key={label} className="px-6 py-4 flex flex-col gap-1"
                        style={{ borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
                        <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: "#475569" }}>{label}</p>
                            {dot && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />}
                        </div>
                        <p className="text-2xl font-black font-mono" style={{ color }}>{valor}</p>
                        <p className="text-xs" style={{ color: "#475569" }}>{sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b" style={{ borderColor: C.border, background: C.surface }}>
                {TABS.map(({ id, label }) => (
                    <button key={id} onClick={() => setTabActiva(id)}
                        className="flex-1 py-3.5 text-sm font-semibold transition-all relative"
                        style={{ color: tabActiva === id ? C.orange : "#64748b", background: "transparent" }}>
                        {label}
                        {tabActiva === id && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: C.orange }} />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            <div className="p-6" style={{ maxWidth: 860, margin: "0 auto" }}>
                {tabActiva === "form" && <FormularioDemo />}
                {tabActiva === "grafica" && <GraficaDemo />}
                {tabActiva === "panel" && <PanelDemo />}
            </div>

        </div>
    );
}