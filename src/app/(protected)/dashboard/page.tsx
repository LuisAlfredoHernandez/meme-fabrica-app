"use client";
// ─────────────────────────────────────────────────────────────
// app/dashboard/page.tsx — RF8, RF9, RF10, RF11
// KPIs globales, reportes, comparativa MTO/MTS, maquinaria
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import {
    ResponsiveContainer, ComposedChart, BarChart, Bar,
    Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from "recharts";
import {
    BarChart3, TrendingUp, Activity,
    Zap, Users, Package,
} from "lucide-react";
import { AppColors } from "@/shared/constants";

import { getDashboardStatsAction } from "@/features/dashboard/actions/dashboard.actions";
import { DashboardDailyStat, DashboardMachineStat, DashboardOperatorStat, DashboardDistribucion } from "@/features/dashboard/services/dashboard.service";

const TooltipCustom = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="p-3 rounded-xl text-xs shadow-2xl" style={{ background: "#1a1d28", border: `1px solid ${AppColors.border}` }}>
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
    
    const [datosSemana, setDatosSemana] = useState<DashboardDailyStat[]>([]);
    const [maquinasUso, setMaquinasUso] = useState<DashboardMachineStat[]>([]);
    const [operariosRendimiento, setOperariosRendimiento] = useState<DashboardOperatorStat[]>([]);
    const [distribucionMaquinas, setDistribucionMaquinas] = useState<DashboardDistribucion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStatsAction(periodoTab);
            setDatosSemana(data.datos_semana);
            setMaquinasUso(data.maquinas_uso);
            setOperariosRendimiento(data.operarios_rendimiento);
            setDistribucionMaquinas(data.distribucion_maquinas);
        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [periodoTab]);

    const fecha = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "2-digit", month: "long" });
    const hora = new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });

    if (loading) {
        return <div className="flex-1 flex items-center justify-center font-bold" style={{ color: AppColors.slate }}>Cargando datos del dashboard...</div>;
    }

    const totalHoy = datosSemana.length > 0 ? datosSemana[0].real : 0;
    const metaHoy = datosSemana.length > 0 ? datosSemana[0].meta : 30;
    const efGlobal = datosSemana.length > 0 ? Math.round(datosSemana.reduce((a, d) => a + d.eficiencia, 0) / datosSemana.length) : 0;
    const maqsActivas = maquinasUso.filter(m => m.estado === "operativa").length;

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Header de página */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: AppColors.border, background: AppColors.surface }}>
                <div>
                    <h1 className="text-lg font-black text-white">Dashboard de Producción</h1>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: AppColors.slate }}>{fecha} · {hora}</p>
                </div>
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                    {(["semana", "mes"] as const).map(p => (
                        <button key={p} onClick={() => setPeriodo(p)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
                            style={{ background: periodoTab === p ? AppColors.orange : "transparent", color: periodoTab === p ? "#fff" : AppColors.slate }}>
                            Esta {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* RF8: KPIs globales */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: `Piezas últim${periodoTab === 'semana' ? 'a semana' : 'o mes'}`, valor: totalHoy, unidad: "de " + metaHoy + " meta", icon: <Package className="w-5 h-5" />, color: AppColors.orange, trend: "Último registro activo" },
                        { label: "Eficiencia global", valor: `${efGlobal}%`, unidad: `est${periodoTab === 'semana' ? 'a semana' : 'e mes'}`, icon: <Zap className="w-5 h-5" />, color: AppColors.emerald, trend: "↑ mejorando" },
                        { 
                            label: "Operarios activos", 
                            valor: operariosRendimiento.filter(o => o.estado === "activo").length, 
                            unidad: `de ${operariosRendimiento.length} total`, 
                            icon: <Users className="w-5 h-5" />, 
                            color: AppColors.sky, 
                            trend: operariosRendimiento.filter(o => o.estado !== "activo").length > 0 ? `${operariosRendimiento.filter(o => o.estado !== "activo").length} ausente(s)` : "Todos activos" 
                        },
                        { 
                            label: "Máquinas en uso", 
                            valor: maqsActivas, 
                            unidad: maquinasUso.filter(m => m.estado !== "operativa").length > 0 ? `${maquinasUso.filter(m => m.estado !== "operativa").length} inactiva(s)` : "Todas operativas", 
                            icon: <Activity className="w-5 h-5" />, 
                            color: AppColors.amber, 
                            trend: maquinasUso.filter(m => m.estado !== "operativa").length > 0 ? "Revisar estado" : "100% online" 
                        },
                    ].map(k => (
                        <div key={k.label} className="rounded-2xl px-5 py-4 space-y-2"
                            style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium" style={{ color: AppColors.slate }}>{k.label}</p>
                                <span style={{ color: k.color }}>{k.icon}</span>
                            </div>
                            <p className="text-3xl font-black font-mono" style={{ color: k.color }}>{k.valor}</p>
                            <p className="text-xs" style={{ color: AppColors.slate }}>{k.unidad}</p>
                            <p className="text-xs font-semibold" style={{ color: k.color }}>{k.trend}</p>
                        </div>
                    ))}
                </div>

                {/* RF9: Real vs Meta + RF10: MTO vs MTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* RF9: Real vs Meta */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                            <BarChart3 className="w-5 h-5" style={{ color: AppColors.orange }} />
                            <h3 className="font-bold text-white text-sm">Producción Real vs Meta</h3>
                        </div>
                        <div className="p-5">
                            <ResponsiveContainer width="100%" height={200}>
                                <ComposedChart data={datosSemana} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={AppColors.border} vertical={false} />
                                    <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<TooltipCustom />} />
                                    <Bar dataKey="real" name="Real" fill={AppColors.orange} radius={[4, 4, 0, 0]} fillOpacity={0.9} />
                                    <Line type="monotone" dataKey="meta" name="Meta" stroke="#475569" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* RF10: MTO vs MTS */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                            <TrendingUp className="w-5 h-5" style={{ color: AppColors.violet }} />
                            <h3 className="font-bold text-white text-sm">Comparativa MTO vs MTS</h3>
                        </div>
                        <div className="p-5">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={datosSemana} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={AppColors.border} vertical={false} />
                                    <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<TooltipCustom />} />
                                    <Bar dataKey="mto" name="MTO (Pedido)" stackId="a" fill={AppColors.violet} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="mts" name="MTS (Stock)" stackId="a" fill={AppColors.sky} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex gap-4 mt-2 text-xs" style={{ color: "#475569" }}>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm inline-block" style={{ background: AppColors.violet }} /> MTO</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm inline-block" style={{ background: AppColors.sky }} /> MTS</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* RF11: Utilización de maquinaria */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                            <Activity className="w-5 h-5" style={{ color: AppColors.sky }} />
                            <h3 className="font-bold text-white text-sm">Maquinaria</h3>
                        </div>
                        <div className="p-5">
                            <div className="space-y-3">
                                {maquinasUso.map(m => {
                                    const color = m.estado === "mantenimiento" ? AppColors.red : m.uso >= 90 ? AppColors.red : m.uso >= 70 ? AppColors.amber : m.uso >= 40 ? AppColors.orange : AppColors.slate;
                                    return (
                                        <div key={m.codigo} className="flex items-center gap-4">
                                            <div className="w-20 shrink-0">
                                                <p className="text-xs font-bold text-white">{m.codigo}</p>
                                            </div>
                                            <div className="flex-1">
                                                {m.estado === "mantenimiento" ? (
                                                    <div className="h-2.5 rounded-full flex items-center px-2"
                                                        style={{ background: `${AppColors.red}20`, border: `1px dashed ${AppColors.red}50` }}>
                                                        <span className="text-[9px] font-bold" style={{ color: AppColors.red }}>OFFLINE</span>
                                                    </div>
                                                ) : (
                                                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                                                        <div className="h-full rounded-full transition-all"
                                                            style={{ width: `${m.uso}%`, background: color }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-10 text-right">
                                                <span className="text-sm font-black font-mono" style={{ color }}>{m.estado === "mantenimiento" ? "—" : `${m.uso}%`}</span>
                                            </div>
                                            <div className="w-16 text-right">
                                                <span className="text-xs font-mono" style={{ color: AppColors.slate }}>{m.piezasSemana > 0 ? `${m.piezasSemana} pzs` : "—"}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Nuevo RF: Distribución de Producción por Máquina */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                            <BarChart3 className="w-5 h-5" style={{ color: AppColors.orange }} />
                            <h3 className="font-bold text-white text-sm">Producción por Máquina</h3>
                        </div>
                        <div className="p-5 flex flex-col items-center justify-center">
                            {distribucionMaquinas.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Tooltip content={<TooltipCustom />} />
                                            <Pie
                                                data={distribucionMaquinas}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="valor"
                                                nameKey="nombre"
                                                stroke="none"
                                            >
                                                {distribucionMaquinas.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs font-medium">
                                        {distribucionMaquinas.map((m) => (
                                            <span key={m.nombre} className="flex items-center gap-1.5" style={{ color: AppColors.slate }}>
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                                                {m.nombre} ({m.valor})
                                            </span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-[220px] flex items-center justify-center text-sm font-medium" style={{ color: AppColors.slate }}>
                                    Sin producción registrada
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RF8: Rendimiento individual de operarios */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                            <Users className="w-5 h-5" style={{ color: AppColors.emerald }} />
                            <h3 className="font-bold text-white text-sm">Operarios</h3>
                        </div>
                        <div className="p-5">
                            <div className="space-y-4">
                                {operariosRendimiento.map(o => {
                                    const color = o.estado === "ausente" ? AppColors.red : o.eficiencia >= 90 ? AppColors.emerald : o.eficiencia >= 75 ? AppColors.orange : AppColors.amber;
                                    return (
                                        <div key={o.nombre} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                                                style={{ background: `${color}20`, color }}>
                                                {o.nombre.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div className="w-20 shrink-0">
                                                <p className="text-xs font-semibold text-white">{o.nombre}</p>
                                            </div>
                                            <div className="flex-1">
                                                {o.estado === "ausente"
                                                    ? <div className="h-2.5 rounded-full flex items-center px-2" style={{ background: `${AppColors.red}20`, border: `1px dashed ${AppColors.red}50` }}>
                                                          <span className="text-[9px] font-bold" style={{ color: AppColors.red }}>AUSENTE</span>
                                                      </div>
                                                    : (
                                                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                                                            <div className="h-full rounded-full transition-all" style={{ width: `${o.eficiencia}%`, background: color }} />
                                                        </div>
                                                    )}
                                            </div>
                                            <span className="w-10 text-right text-sm font-black font-mono" style={{ color }}>{o.estado === "ausente" ? "—" : `${o.eficiencia}%`}</span>
                                            <span className="w-16 text-right text-xs font-mono" style={{ color: AppColors.slate }}>{o.piezasSemana > 0 ? `${o.piezasSemana} pzs` : "—"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}