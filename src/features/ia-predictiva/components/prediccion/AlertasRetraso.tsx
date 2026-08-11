import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppColors } from "../IaShared";

interface AlertasRetrasoProps {
    activeDelays: { riesgo: string; msg: string }[];
}

export function AlertasRetraso({ activeDelays }: AlertasRetrasoProps) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                <AlertTriangle className="w-5 h-5" style={{ color: AppColors.amber }} />
                <h3 className="font-bold text-white text-sm">Detección Temprana de Retrasos en Cola Activa</h3>
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
    );
}
