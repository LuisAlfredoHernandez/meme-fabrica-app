import { useState } from "react";
import { CheckCircle2, ChevronDown, Clock } from "lucide-react";
import { AppColors, NIVEL_CFG } from "./IaShared";

interface TabCuellosProps {
    cuellos: any[];
}

export function TabCuellos({ cuellos }: TabCuellosProps) {
    const [expCuello, setExp] = useState<Record<string, boolean>>({});

    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-400">RF15 — Detección en tiempo real de saturación en estaciones de trabajo</p>
            
            {cuellos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl" style={{ borderColor: AppColors.border }}>
                    <CheckCircle2 className="w-10 h-10 mb-2" style={{ color: AppColors.emerald }} />
                    <p className="text-sm font-bold text-white">Flujo Saludable / Sin Datos</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                        Actualmente no hay máquinas registradas en el sistema o no se detectan cuellos de botella en la planta.
                    </p>
                </div>
            ) : (
                cuellos.map(cuello => {
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
                })
            )}
        </div>
    );
}
