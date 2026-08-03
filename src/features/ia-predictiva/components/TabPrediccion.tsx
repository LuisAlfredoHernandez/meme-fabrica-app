import { useState, useEffect } from "react";
import { Brain, AlertTriangle, Zap, Package, RefreshCw, CheckCircle2, BarChart3, ArrowRight, GitCompare } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AppColors, TooltipIA } from "./IaShared";
import {
    predictDeliveryTimeAction,
    predictOrderItemsAction,
    simulateMtsAction
} from "@/features/ia-predictiva/actions/ia.actions";

interface TabPrediccionProps {
    proyecciones: any[];
    activeDelays: { riesgo: string; msg: string }[];
}

export function TabPrediccion({ proyecciones, activeDelays }: TabPrediccionProps) {
    // Estados para la Calculadora de Tiempos
    const [calcPiezas, setCalcPiezas] = useState<number>(300);
    const [calcLineas, setCalcLineas] = useState<number>(1);
    const [calcPrioridad, setCalcPrioridad] = useState<boolean>(false);
    const [calcPrenda, setCalcPrenda] = useState<string>("camiseta");
    const [calcResultado, setCalcResultado] = useState<any>(null);
    const [calcErrorMsg, setCalcErrorMsg] = useState<string | null>(null);
    const [calculando, setCalculando] = useState<boolean>(false);

    // Estados para predicción multilínea (RF12)
    const [isMultilinea, setIsMultilinea] = useState<boolean>(false);
    const [itemsMultilinea, setItemsMultilinea] = useState<{ tipo_prenda: string; cantidad_piezas: number }[]>([]);
    const [prendaAgregada, setPrendaAgregada] = useState<string>("camiseta");
    const [cantidadAgregada, setCantidadAgregada] = useState<number>(100);

    // Estados de simulación MTS
    const [mtsCantidad, setMtsCantidad] = useState(150);
    const [simulacionMts, setSimulacionMts] = useState<any[]>([]);
    const [simulando, setSimulando] = useState(false);

    const agregarPrendaMultilinea = () => {
        if (cantidadAgregada <= 0) return;
        setItemsMultilinea(prev => {
            const index = prev.findIndex(item => item.tipo_prenda === prendaAgregada);
            if (index !== -1) {
                const updated = [...prev];
                updated[index].cantidad_piezas += cantidadAgregada;
                return updated;
            }
            return [...prev, { tipo_prenda: prendaAgregada, cantidad_piezas: cantidadAgregada }];
        });
    };

    const eliminarPrendaMultilinea = (tipoPrenda: string) => {
        setItemsMultilinea(prev => prev.filter(item => item.tipo_prenda !== tipoPrenda));
    };

    const ejecutarCalculadora = async () => {
        setCalculando(true);
        setCalcErrorMsg(null);
        setCalcResultado(null);
        try {
            if (isMultilinea) {
                if (itemsMultilinea.length === 0) {
                    throw new Error("Debe agregar al menos una prenda a la lista de la orden.");
                }
                const data = await predictOrderItemsAction(itemsMultilinea, calcPrioridad, calcLineas);
                setCalcResultado(data);
            } else {
                const data = await predictDeliveryTimeAction(calcPiezas, calcPrioridad, calcLineas, calcPrenda);
                setCalcResultado(data);
            }
        } catch (e: any) {
            setCalcErrorMsg(e.message || "Error al calcular la predicción.");
        } finally {
            setCalculando(false);
        }
    };

    const runSimulation = async (cant: number) => {
        if (!cant || cant <= 0 || isNaN(cant)) {
            setSimulacionMts([]);
            return;
        }
        setSimulando(true);
        try {
            const result = await simulateMtsAction(cant);
            setSimulacionMts(result.impactos);
        } catch (e) {
            console.error("Error simulando:", e);
        } finally {
            setSimulando(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => {
            runSimulation(mtsCantidad);
        }, 800);
        return () => clearTimeout(t);
    }, [mtsCantidad]);

    return (
        <div className="space-y-5">
            {/* RF12: Calculadora de Tiempos de Entrega */}
            <div className="rounded-2xl overflow-hidden animate-in fade-in duration-300 border" style={{ background: AppColors.surface, borderColor: AppColors.border }}>
                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                    <Brain className="w-5 h-5" style={{ color: AppColors.violet }} />
                    <h3 className="font-bold text-white text-sm">Calculadora de Tiempos de Entrega (RF12)</h3>
                </div>
                <div className="p-5 space-y-4">
                    {/* Selector de Tipo de Predicción */}
                    <div className="flex gap-2 p-1 rounded-xl bg-[#0d1018] border" style={{ borderColor: AppColors.border }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsMultilinea(false);
                                setCalcResultado(null);
                                setCalcErrorMsg(null);
                            }}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            style={{
                                background: !isMultilinea ? AppColors.orange : "transparent",
                                color: !isMultilinea ? "#fff" : AppColors.slate
                            }}
                        >
                            Prenda Individual
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsMultilinea(true);
                                setCalcResultado(null);
                                setCalcErrorMsg(null);
                            }}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            style={{
                                background: isMultilinea ? AppColors.orange : "transparent",
                                color: isMultilinea ? "#fff" : AppColors.slate
                            }}
                        >
                            Orden Completa (Multilínea)
                        </button>
                    </div>

                    {!isMultilinea ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Prenda</label>
                                <select
                                    value={calcPrenda}
                                    onChange={(e) => setCalcPrenda(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg text-xs bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50 cursor-pointer"
                                >
                                    <option value="camiseta">Camiseta</option>
                                    <option value="pantalon">Pantalón</option>
                                    <option value="jogger">Jogger</option>
                                    <option value="sudadera">Sudadera</option>
                                    <option value="chaqueta">Chaqueta</option>
                                    <option value="vestido">Vestido</option>
                                    <option value="corbata">Corbata</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Cantidad de piezas</label>
                                <input
                                    type="number"
                                    value={calcPiezas}
                                    onChange={(e) => setCalcPiezas(Number(e.target.value))}
                                    className="w-full h-10 px-3 rounded-lg text-xs font-mono bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Prenda a agregar</label>
                                    <select
                                        value={prendaAgregada}
                                        onChange={(e) => setPrendaAgregada(e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg text-xs bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50 cursor-pointer"
                                    >
                                        <option value="camiseta">Camiseta</option>
                                        <option value="pantalon">Pantalón</option>
                                        <option value="jogger">Jogger</option>
                                        <option value="sudadera">Sudadera</option>
                                        <option value="chaqueta">Chaqueta</option>
                                        <option value="vestido">Vestido</option>
                                        <option value="corbata">Corbata</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Cantidad piezas</label>
                                    <input
                                        type="number"
                                        value={cantidadAgregada}
                                        onChange={(e) => setCantidadAgregada(Number(e.target.value))}
                                        className="w-full h-10 px-3 rounded-lg text-xs font-mono bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarPrendaMultilinea}
                                    className="w-full h-10 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    style={{
                                        background: `${AppColors.orange}15`,
                                        color: AppColors.orange,
                                        border: `1px solid ${AppColors.orange}35`
                                    }}
                                >
                                    + Agregar Prenda
                                </button>
                            </div>

                            {/* Lista de prendas agregadas */}
                            <div className="rounded-xl border bg-[#0d1018]/50 overflow-hidden" style={{ borderColor: AppColors.border }}>
                                <div className="px-4 py-2 border-b bg-[#0d1018] flex items-center justify-between" style={{ borderColor: AppColors.border }}>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Prendas en la Orden</span>
                                    <span className="text-[10px] text-indigo-400 font-bold font-mono">{itemsMultilinea.length} prendas</span>
                                </div>
                                {itemsMultilinea.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-500 italic">No hay prendas agregadas a la orden de simulación.</div>
                                ) : (
                                    <div className="divide-y divide-[#1e2130] max-h-40 overflow-y-auto custom-scrollbar">
                                        {itemsMultilinea.map((item) => (
                                            <div key={item.tipo_prenda} className="flex justify-between items-center px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-3.5 h-3.5" style={{ color: AppColors.violet }} />
                                                    <span className="text-xs font-semibold text-white capitalize">{item.tipo_prenda}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono font-bold text-slate-300">{item.cantidad_piezas} piezas</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarPrendaMultilinea(item.tipo_prenda)}
                                                        className="p-1 rounded text-red-400 bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Líneas de producción</label>
                            <input
                                type="number"
                                value={calcLineas}
                                onChange={(e) => setCalcLineas(Number(e.target.value))}
                                className="w-full h-10 px-3 rounded-lg text-xs font-mono bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50"
                            />
                        </div>
                        <div className="flex items-center h-full pt-4">
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={calcPrioridad}
                                    onChange={(e) => setCalcPrioridad(e.target.checked)}
                                    className="w-4 h-4 rounded bg-[#0d1018] border-white/5 focus:ring-0 cursor-pointer"
                                    style={{ color: AppColors.orange }}
                                />
                                <span>Prioridad Alta / Urgente</span>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={ejecutarCalculadora}
                        disabled={calculando}
                        className="w-full h-10 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                        style={{ background: AppColors.violet }}
                    >
                        {calculando ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Estimando...</> : <><Zap className="w-3.5 h-3.5" /> Calcular Estimación</>}
                    </button>

                    {/* Alerta de error (Modelo no entrenado) */}
                    {calcErrorMsg && (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Estimación no disponible</p>
                                <p className="mt-0.5 leading-relaxed">{calcErrorMsg}</p>
                            </div>
                        </div>
                    )}

                    {/* Alerta prenda nueva (Unitario) */}
                    {!isMultilinea && calcResultado && calcResultado.prenda_nueva && (
                        <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200"
                            style={{ background: `${AppColors.amber}10`, border: `1px solid ${AppColors.amber}25`, color: AppColors.amber }}>
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                                <p className="font-bold">Estimación No Disponible (Prenda Nueva)</p>
                                <p className="mt-0.5 leading-relaxed text-slate-300">
                                    La prenda seleccionada (<strong className="text-white capitalize">{calcPrenda}</strong>) es nueva en planta y no cuenta con registros históricos. Por seguridad y para evitar datos no verídicos, la estimación del tiempo por IA está desactivada. Ingrese el tiempo estimado manualmente o suba datos de producción de esta prenda para calibrar el modelo.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Alerta prenda nueva global (Multilínea) */}
                    {isMultilinea && calcResultado && calcResultado.prenda_nueva_global && (
                        <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200"
                            style={{ background: `${AppColors.amber}10`, border: `1px solid ${AppColors.amber}25`, color: AppColors.amber }}>
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                                <p className="font-bold">Estimación Global Bloqueada (Prenda Nueva Detectada)</p>
                                <p className="mt-0.5 leading-relaxed text-slate-300">
                                    Uno o más tipos de prenda en la orden no cuentan con historial de costura previo. Por seguridad, no se puede calcular un tiempo consolidado global confiable. Por favor, revise el desglose por ítem a continuación.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resultados de cálculo (Unitario) */}
                    {!isMultilinea && calcResultado && !calcResultado.prenda_nueva && calcResultado.tiempo_estimado_horas !== null && (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Estimación Completada ({calcResultado.algoritmo_usado})</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Tiempo estimado:</span>
                                    <span className="text-lg font-black text-white font-mono">{calcResultado.tiempo_estimado_horas} hrs</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Margen de error:</span>
                                    <span className="text-lg font-black text-slate-300 font-mono">± {calcResultado.margen_error_horas} hrs</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resultados de cálculo (Multilínea) */}
                    {isMultilinea && calcResultado && (
                        <div className="space-y-3 animate-in zoom-in-95 duration-200">
                            {!calcResultado.prenda_nueva_global && calcResultado.tiempo_estimado_total_horas !== null && (
                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Estimación Consolidada Completada</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-slate-400 block font-semibold mb-0.5">Tiempo Total Consolidado:</span>
                                            <span className="text-lg font-black text-white font-mono">{calcResultado.tiempo_estimado_total_horas} hrs</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block font-semibold mb-0.5">Margen de Error Acumulado:</span>
                                            <span className="text-lg font-black text-slate-300 font-mono">± {calcResultado.margen_error_total_horas} hrs</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Desglose de cada prenda */}
                            <div className="rounded-xl border overflow-hidden text-xs bg-[#0d1018]/50" style={{ borderColor: AppColors.border }}>
                                <div className="px-4 py-2 border-b bg-[#0d1018] text-slate-400 font-bold uppercase" style={{ borderColor: AppColors.border }}>
                                    Desglose de Estimaciones por Ítem
                                </div>
                                <div className="divide-y divide-[#1e2130] max-h-48 overflow-y-auto custom-scrollbar">
                                    {calcResultado.detalles?.map((det: any) => (
                                        <div key={det.tipo_prenda} className="px-4 py-2.5 flex justify-between items-start gap-4">
                                            <div>
                                                <p className="font-semibold text-white capitalize">{det.tipo_prenda}</p>
                                                <p className="text-[10px] text-slate-500 font-bold">{det.cantidad_piezas} piezas</p>
                                            </div>
                                            <div className="text-right">
                                                {det.prenda_nueva ? (
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                                                        style={{
                                                            color: AppColors.orange,
                                                            background: `${AppColors.orange}10`,
                                                            border: `1px solid ${AppColors.orange}30`
                                                        }}>
                                                        Prenda Nueva (Sin estimar)
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <p className="font-bold text-white font-mono">{det.tiempo_estimado_horas} hrs</p>
                                                        <p className="text-[9px] text-slate-400 font-mono">± {det.margen_error_horas} hrs</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Gráfica proyección */}
            <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                    <BarChart3 className="w-5 h-5" style={{ color: AppColors.orange }} />
                    <h3 className="font-bold text-white text-sm">Proyección de Producción Diaria (RF13)</h3>
                </div>
                <div className="p-5">
                    {proyecciones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[260px] text-center border-2 border-dashed rounded-xl" style={{ borderColor: AppColors.border }}>
                            <p className="text-sm font-bold text-slate-300">Esperando datos reales de producción</p>
                            <p className="text-xs text-slate-500 mt-2 max-w-[300px]">
                                La IA requiere que al menos un supervisor valide los reportes de avance de los operarios para poder proyectar la tendencia diaria.
                            </p>
                        </div>
                    ) : (
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
                    )}
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
                    {activeDelays.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <CheckCircle2 className="w-10 h-10 mb-2" style={{ color: AppColors.emerald }} />
                            <p className="text-sm font-bold text-white">Saludable</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                                No se detectan retrasos. Todas las órdenes en cola están avanzando a tiempo.
                            </p>
                        </div>
                    ) : (
                        activeDelays.map((r, i) => {
                            const color = r.riesgo === "alto" ? AppColors.red : AppColors.amber;
                            return (
                                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                                    style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                                    <p className="text-sm text-slate-300" style={{ color: "#cbd5e1" }}>{r.msg}</p>
                                </div>
                            );
                        })
                    )}
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
                    ) : simulacionMts.length === 0 && mtsCantidad > 0 ? (
                        <div className="text-xs text-slate-500 py-4 text-center">No hay órdenes MTO activas para simular un impacto.</div>
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
    );
}
