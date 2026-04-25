"use client";
// ─────────────────────────────────────────────────────────────
// app/dashboard/page.tsx — RF8, RF9, RF10, RF11
// KPIs globales, reportes, comparativa MTO/MTS, maquinaria
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
    ResponsiveContainer, ComposedChart, BarChart, Bar,
    Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
    BarChart3, TrendingUp, Activity,
    Zap, Users, Package,
} from "lucide-react";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", sky: "#38bdf8", slate: "#475569",
};

// ── Mock data ─────────────────────────────────────────────────

const DATOS_SEMANA = [
    { d: "Lun", real: 28, meta: 30, mto: 18, mts: 10, eficiencia: 93 },
    { d: "Mar", real: 24, meta: 30, mto: 20, mts: 4, eficiencia: 80 },
    { d: "Mié", real: 31, meta: 30, mto: 22, mts: 9, eficiencia: 103 },
    { d: "Jue", real: 27, meta: 30, mto: 19, mts: 8, eficiencia: 90 },
    { d: "Vie", real: 29, meta: 30, mto: 21, mts: 8, eficiencia: 97 },
    { d: "Sáb", real: 15, meta: 20, mto: 10, mts: 5, eficiencia: 75 },
];

const MAQUINAS_USO = [
    { codigo: "MERROW-01", tipo: "Merrow", uso: 94, estado: "activa", piezasHoy: 42 },
    { codigo: "MERROW-02", tipo: "Merrow", uso: 71, estado: "activa", piezasHoy: 35 },
    { codigo: "MERROW-03", tipo: "Merrow", uso: 78, estado: "activa", piezasHoy: 38 },
    { codigo: "COVER-01", tipo: "Cover", uso: 58, estado: "activa", piezasHoy: 28 },
    { codigo: "COVER-02", tipo: "Cover", uso: 44, estado: "activa", piezasHoy: 20 },
    { codigo: "PLANA-01", tipo: "Plana", uso: 35, estado: "activa", piezasHoy: 18 },
    { codigo: "CORTE-01", tipo: "Corte", uso: 62, estado: "activa", piezasHoy: 55 },
    { codigo: "CORTE-02", tipo: "Corte", uso: 0, estado: "mantenimiento", piezasHoy: 0 },
    { codigo: "DTF-01", tipo: "DTF", uso: 33, estado: "activa", piezasHoy: 12 },
    { codigo: "DTF-02", tipo: "DTF", uso: 28, estado: "activa", piezasHoy: 10 },
];

const OPERARIOS_RENDIMIENTO = [
    { nombre: "Carmen M.", eficiencia: 88, piezasHoy: 42, estado: "activo" },
    { nombre: "María S.", eficiencia: 91, piezasHoy: 55, estado: "activo" },
    { nombre: "Luis C.", eficiencia: 95, piezasHoy: 48, estado: "activo" },
    { nombre: "Rafael N.", eficiencia: 82, piezasHoy: 35, estado: "activo" },
    { nombre: "Josué R.", eficiencia: 74, piezasHoy: 28, estado: "activo" },
    { nombre: "Paola H.", eficiencia: 0, piezasHoy: 0, estado: "ausente" },
];

const TooltipCustom = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="p-3 rounded-xl text-xs shadow-2xl" style={{ background: "#1a1d28", border: `1px solid ${C.border}` }}>
            <p className="mb-2 font-medium" style={{ color: "#64748b" }}>{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
                    <span className="flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        {p.name ?? p.dataKey}
                    </span>
                    <span className="font-bold font-mono text-white">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function DashboardPage() {
    const [periodoTab, setPeriodo] = useState<"semana" | "mes">("semana");
    const fecha = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "2-digit", month: "long" });
    const hora = new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });

    const totalHoy = DATOS_SEMANA[DATOS_SEMANA.length - 2].real;
    const metaHoy = DATOS_SEMANA[DATOS_SEMANA.length - 2].meta;
    const efGlobal = Math.round(DATOS_SEMANA.reduce((a, d) => a + d.eficiencia, 0) / DATOS_SEMANA.length);
    const maqsActivas = MAQUINAS_USO.filter(m => m.estado === "activa").length;

    return (
        <div className="flex-1 overflow-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Header de página */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border, background: C.surface }}>
                <div>
                    <h1 className="text-lg font-black text-white">Dashboard de Producción</h1>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: C.slate }}>{fecha} · {hora}</p>
                </div>
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                    {(["semana", "mes"] as const).map(p => (
                        <button key={p} onClick={() => setPeriodo(p)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
                            style={{ background: periodoTab === p ? C.orange : "transparent", color: periodoTab === p ? "#fff" : C.slate }}>
                            Esta {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* RF8: KPIs globales */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Piezas producidas hoy", valor: totalHoy, unidad: "de " + metaHoy + " meta", icon: <Package className="w-5 h-5" />, color: C.orange, trend: "+8% vs ayer" },
                        { label: "Eficiencia global", valor: `${efGlobal}%`, unidad: "esta semana", icon: <Zap className="w-5 h-5" />, color: C.emerald, trend: "↑ mejorando" },
                        { label: "Operarios activos", valor: OPERARIOS_RENDIMIENTO.filter(o => o.estado === "activo").length, unidad: `de ${OPERARIOS_RENDIMIENTO.length} total`, icon: <Users className="w-5 h-5" />, color: C.sky, trend: "1 ausente" },
                        { label: "Máquinas en uso", valor: maqsActivas, unidad: "1 en mantenimiento", icon: <Activity className="w-5 h-5" />, color: C.amber, trend: "CORTE-02 offline" },
                    ].map(k => (
                        <div key={k.label} className="rounded-2xl px-5 py-4 space-y-2"
                            style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium" style={{ color: C.slate }}>{k.label}</p>
                                <span style={{ color: k.color }}>{k.icon}</span>
                            </div>
                            <p className="text-3xl font-black font-mono" style={{ color: k.color }}>{k.valor}</p>
                            <p className="text-xs" style={{ color: C.slate }}>{k.unidad}</p>
                            <p className="text-xs font-semibold" style={{ color: k.color }}>{k.trend}</p>
                        </div>
                    ))}
                </div>

                {/* RF9: Real vs Meta + RF10: MTO vs MTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* RF9: Real vs Meta */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                            <BarChart3 className="w-5 h-5" style={{ color: C.orange }} />
                            <h3 className="font-bold text-white text-sm">Producción Real vs Meta — RF9</h3>
                        </div>
                        <div className="p-5">
                            <ResponsiveContainer width="100%" height={200}>
                                <ComposedChart data={DATOS_SEMANA} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                                    <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<TooltipCustom />} />
                                    <Bar dataKey="real" name="Real" fill={C.orange} radius={[4, 4, 0, 0]} fillOpacity={0.9} />
                                    <Line type="monotone" dataKey="meta" name="Meta" stroke="#475569" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* RF10: MTO vs MTS */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                            <TrendingUp className="w-5 h-5" style={{ color: C.violet }} />
                            <h3 className="font-bold text-white text-sm">Comparativa MTO vs MTS — RF10</h3>
                        </div>
                        <div className="p-5">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={DATOS_SEMANA} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                                    <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<TooltipCustom />} />
                                    <Bar dataKey="mto" name="MTO (Pedido)" stackId="a" fill={C.violet} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="mts" name="MTS (Stock)" stackId="a" fill={C.sky} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex gap-4 mt-2 text-xs" style={{ color: "#475569" }}>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm inline-block" style={{ background: C.violet }} /> MTO</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm inline-block" style={{ background: C.sky }} /> MTS</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RF11: Utilización de maquinaria */}
                <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                        <Activity className="w-5 h-5" style={{ color: C.sky }} />
                        <h3 className="font-bold text-white text-sm">Utilización de Maquinaria — RF11</h3>
                    </div>
                    <div className="p-5">
                        <div className="space-y-3">
                            {MAQUINAS_USO.map(m => {
                                const color = m.estado === "mantenimiento" ? C.red : m.uso >= 90 ? C.red : m.uso >= 70 ? C.amber : m.uso >= 40 ? C.orange : C.slate;
                                return (
                                    <div key={m.codigo} className="flex items-center gap-4">
                                        <div className="w-24 shrink-0">
                                            <p className="text-xs font-bold text-white">{m.codigo}</p>
                                            <p className="text-xs" style={{ color: C.slate }}>{m.tipo}</p>
                                        </div>
                                        <div className="flex-1">
                                            {m.estado === "mantenimiento" ? (
                                                <div className="h-2.5 rounded-full flex items-center px-2"
                                                    style={{ background: `${C.red}20`, border: `1px dashed ${C.red}50` }}>
                                                    <span className="text-[9px] font-bold" style={{ color: C.red }}>EN MANTENIMIENTO</span>
                                                </div>
                                            ) : (
                                                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                                                    <div className="h-full rounded-full transition-all"
                                                        style={{ width: `${m.uso}%`, background: color }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-12 text-right">
                                            <span className="text-sm font-black font-mono" style={{ color }}>{m.estado === "mantenimiento" ? "—" : `${m.uso}%`}</span>
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className="text-xs font-mono" style={{ color: C.slate }}>{m.piezasHoy > 0 ? `${m.piezasHoy} pzs` : "—"}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 flex gap-4 text-xs" style={{ color: "#475569" }}>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: C.red }} /> Saturada ≥90%</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: C.amber }} /> Alta ≥70%</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: C.orange }} /> Normal ≥40%</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: C.slate }} /> Ociosa</span>
                        </div>
                    </div>
                </div>

                {/* RF8: Rendimiento individual de operarios */}
                <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                        <Users className="w-5 h-5" style={{ color: C.emerald }} />
                        <h3 className="font-bold text-white text-sm">Rendimiento Individual — RF8</h3>
                    </div>
                    <div className="p-5">
                        <div className="space-y-4">
                            {OPERARIOS_RENDIMIENTO.map(o => {
                                const color = o.estado === "ausente" ? C.slate : o.eficiencia >= 90 ? C.emerald : o.eficiencia >= 75 ? C.orange : C.red;
                                return (
                                    <div key={o.nombre} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                                            style={{ background: `${color}20`, color }}>
                                            {o.nombre.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div className="w-24 shrink-0">
                                            <p className="text-xs font-semibold text-white">{o.nombre}</p>
                                        </div>
                                        <div className="flex-1">
                                            {o.estado === "ausente"
                                                ? <p className="text-xs" style={{ color: C.slate }}>Ausente</p>
                                                : (
                                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                                                        <div className="h-full rounded-full" style={{ width: `${o.eficiencia}%`, background: color }} />
                                                    </div>
                                                )}
                                        </div>
                                        <span className="w-12 text-right text-sm font-black font-mono" style={{ color }}>{o.estado === "ausente" ? "—" : `${o.eficiencia}%`}</span>
                                        <span className="w-16 text-right text-xs font-mono" style={{ color: C.slate }}>{o.piezasHoy > 0 ? `${o.piezasHoy} pzs` : "—"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}