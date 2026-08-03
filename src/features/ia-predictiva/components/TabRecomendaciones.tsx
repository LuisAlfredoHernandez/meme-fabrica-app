import { CheckCircle2, UserCheck, ArrowRight, TrendingUp, X } from "lucide-react";
import { AppColors } from "./IaShared";

interface TabRecomendacionesProps {
    recs: any[];
    setRecs: React.Dispatch<React.SetStateAction<any[]>>;
}

export function TabRecomendaciones({ recs, setRecs }: TabRecomendacionesProps) {
    const aceptarRecomendacion = (id: string) => {
        setRecs(prev => prev.map(r => r.id === id ? { ...r, aceptada: true } : r));
    };

    const rechazarRecomendacion = (id: string) => {
        setRecs(prev => prev.map(r => r.id === id ? { ...r, aceptada: false } : r));
    };

    return (
        <div className="space-y-4">
            <p className="text-xs text-slate-400">RF15 — Balanceo asistido redistribuyendo operarios calificados hacia estaciones Merrow/Cover</p>
            
            {recs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-xl" style={{ borderColor: AppColors.border }}>
                    <CheckCircle2 className="w-10 h-10 mb-2" style={{ color: AppColors.emerald }} />
                    <p className="text-sm font-bold text-white">Sin recomendaciones pendientes</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                        No hay operarios calificados para balancear, o no se detectaron cuellos de botella que requieran asistencia de la IA.
                    </p>
                </div>
            ) : (
                recs.map(r => {
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
            })
            )}
        </div>
    );
}
