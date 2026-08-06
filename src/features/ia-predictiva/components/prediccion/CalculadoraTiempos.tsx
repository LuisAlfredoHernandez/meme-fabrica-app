import { useState, useEffect } from "react";
import { Brain, Zap, Package, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Trash2 } from "lucide-react";
import { AppColors } from "../IaShared";
import { predictDeliveryTimeAction, predictOrderItemsAction, getUniqueGarmentsAction } from "@/features/ia-predictiva/actions/ia.actions";

export function CalculadoraTiempos() {
    const [calcPiezas, setCalcPiezas] = useState<number>(0);
    const [calcLineas, setCalcLineas] = useState<number>(1);
    const [calcPrenda, setCalcPrenda] = useState<string>("camiseta");
    const [calcResultado, setCalcResultado] = useState<any>(null);
    const [calcErrorMsg, setCalcErrorMsg] = useState<string | null>(null);
    const [calculando, setCalculando] = useState<boolean>(false);

    const [prendasDB, setPrendasDB] = useState<string[]>([]);

    useEffect(() => {
        getUniqueGarmentsAction()
            .then(res => {
                if (res && res.prendas && res.prendas.length > 0) {
                    setPrendasDB(res.prendas);
                    setCalcPrenda(res.prendas[0]);
                    setPrendaAgregada(res.prendas[0]);
                }
            })
            .catch(err => console.error("Error cargando prendas", err));
    }, []);

    const [isMultilinea, setIsMultilinea] = useState<boolean>(false);
    const [itemsMultilinea, setItemsMultilinea] = useState<{ tipo_prenda: string; cantidad_piezas: number }[]>([]);
    const [prendaAgregada, setPrendaAgregada] = useState<string>("camiseta");
    const [cantidadAgregada, setCantidadAgregada] = useState<number>(100);

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
                const data = await predictOrderItemsAction(itemsMultilinea, false, calcLineas);
                setCalcResultado(data);
            } else {
                const data = await predictDeliveryTimeAction(calcPiezas, false, calcLineas, calcPrenda);
                setCalcResultado(data);
            }
        } catch (e: any) {
            setCalcErrorMsg(e.message || "Error al calcular la predicción.");
        } finally {
            setCalculando(false);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden animate-in fade-in duration-300 border" style={{ background: AppColors.surface, borderColor: AppColors.border }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                <Brain className="w-5 h-5" style={{ color: AppColors.violet }} />
                <h3 className="font-bold text-white text-sm">Calculadora de Tiempos de Entrega (RF12)</h3>
            </div>
            <div className="p-5 space-y-4">
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
                                {prendasDB.length > 0 ? (
                                    prendasDB.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))
                                ) : (
                                    <option value="Cargando...">Cargando...</option>
                                )}
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
                                    {prendasDB.length > 0 ? (
                                        prendasDB.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))
                                    ) : (
                                        <option value="Cargando...">Cargando...</option>
                                    )}
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

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Líneas de producción</label>
                        <input
                            type="number"
                            value={calcLineas}
                            onChange={(e) => setCalcLineas(Number(e.target.value))}
                            className="w-full h-10 px-3 rounded-lg text-xs font-mono bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50"
                        />
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

                {/* Alertas */}
                {calcErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Estimación no disponible</p>
                            <p className="mt-0.5 leading-relaxed">{calcErrorMsg}</p>
                        </div>
                    </div>
                )}

                {!isMultilinea && calcResultado && calcResultado.prenda_nueva && (
                    <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200"
                        style={{ background: `${AppColors.amber}10`, border: `1px solid ${AppColors.amber}25`, color: AppColors.amber }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                            <p className="font-bold">Estimación No Disponible (Prenda Nueva)</p>
                            <p className="mt-0.5 leading-relaxed text-slate-300">
                                La prenda seleccionada (<strong className="text-white capitalize">{calcPrenda}</strong>) es nueva en planta y no cuenta con registros históricos.
                            </p>
                        </div>
                    </div>
                )}

                {isMultilinea && calcResultado && calcResultado.prenda_nueva_global && (
                    <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200"
                        style={{ background: `${AppColors.amber}10`, border: `1px solid ${AppColors.amber}25`, color: AppColors.amber }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                            <p className="font-bold">Estimación Global Bloqueada (Prenda Nueva Detectada)</p>
                            <p className="mt-0.5 leading-relaxed text-slate-300">
                                Uno o más tipos de prenda en la orden no cuentan con historial previo.
                            </p>
                        </div>
                    </div>
                )}

                {/* Advertencia de Extrapolación Individual */}
                {!isMultilinea && calcResultado && !calcResultado.prenda_nueva && calcResultado.fuera_de_rango && (
                    <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200 mt-2"
                        style={{ background: `${AppColors.orange}10`, border: `1px solid ${AppColors.orange}25`, color: AppColors.orange }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Datos Fuera de Rango (Extrapolación)</p>
                            <p className="mt-0.5 leading-relaxed text-slate-300">
                                La cantidad de piezas solicitada excede significativamente el historial de entrenamiento para esta prenda. La estimación es una extrapolación matemática y podría perder precisión.
                            </p>
                        </div>
                    </div>
                )}

                {/* Advertencia de Extrapolación Multilínea */}
                {isMultilinea && calcResultado && !calcResultado.prenda_nueva_global && calcResultado.detalles?.some((d: any) => d.fuera_de_rango) && (
                    <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200 mt-2"
                        style={{ background: `${AppColors.orange}10`, border: `1px solid ${AppColors.orange}25`, color: AppColors.orange }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Datos Fuera de Rango (Extrapolación)</p>
                            <p className="mt-0.5 leading-relaxed text-slate-300">
                                Uno o más ítems en esta orden superan el máximo histórico entrenado. Sus estimaciones son extrapolaciones matemáticas y podrían ser inexactas.
                            </p>
                        </div>
                    </div>
                )}

                {/* Resultados */}
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
                                                    <p className="font-bold text-white font-mono flex items-center gap-1 justify-end">
                                                        {det.fuera_de_rango && <AlertTriangle className="w-3 h-3 text-orange-400" title="Extrapolación" />}
                                                        {det.tiempo_estimado_horas} hrs
                                                    </p>
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
    );
}
