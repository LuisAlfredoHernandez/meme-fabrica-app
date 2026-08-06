import { useState, useEffect } from "react";
import { GitCompare, ArrowRight, AlertTriangle, Info } from "lucide-react";
import { AppColors } from "../IaShared";
import { simulateMtsAction } from "@/features/ia-predictiva/actions/ia.actions";

export function SimuladorMts() {
    const [mtsCantidad, setMtsCantidad] = useState(0);
    const [simulacionMts, setSimulacionMts] = useState<any[]>([]);
    const [simulando, setSimulando] = useState(false);

    const runSimulation = async (cant: number) => {
        if (!cant || cant <= 0 || isNaN(cant)) {
            setSimulacionMts([]);
            return;
        }
        setSimulando(true);
        try {
            const result = await simulateMtsAction(cant);
            setSimulacionMts(result);
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
                        {simulacionMts[0]?.fuera_de_rango && (
                            <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200 mb-2"
                                style={{ background: `${AppColors.orange}10`, border: `1px solid ${AppColors.orange}25`, color: AppColors.orange }}>
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Datos Fuera de Rango (Extrapolación)</p>
                                    <p className="mt-0.5 leading-relaxed text-slate-300">
                                        La cantidad de stock {mtsCantidad} piezas excede significativamente el récord histórico de producción de la planta. El impacto calculado es una extrapolación y podría perder precisión matemática.
                                    </p>
                                </div>
                            </div>
                        )}
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
                        {simulacionMts.some(r => r.impacto === "Protegido (Prioridad Alta)") && (
                            <div className="flex items-center gap-2 p-3 mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                                <Info className="w-5 h-5 shrink-0" />
                                <div className="text-sm">
                                    <span className="font-bold">Prioridad Protegida: </span>
                                    Los pedidos MTO urgentes/altos no se retrasan por producción de stock (MTS).
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
