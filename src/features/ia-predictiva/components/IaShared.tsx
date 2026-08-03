import { Zap, AlertTriangle, Info } from "lucide-react";
import React from "react";

export const AppColors = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", sky: "#38bdf8", slate: "#475569",
};

export const NIVEL_CFG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
    critica: { color: AppColors.red, bg: `${AppColors.red}10`, border: `${AppColors.red}35`, icon: <Zap className="w-4 h-4" />, label: "Crítico" },
    advertencia: { color: AppColors.amber, bg: `${AppColors.amber}10`, border: `${AppColors.amber}35`, icon: <AlertTriangle className="w-4 h-4" />, label: "Advertencia" },
    info: { color: AppColors.sky, bg: `${AppColors.sky}10`, border: `${AppColors.sky}35`, icon: <Info className="w-4 h-4" />, label: "Info" },
};

export const TooltipIA = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const map: Record<string, { n: string; color: string }> = {
        meta: { n: "Meta", color: "#475569" }, 
        real: { n: "Real", color: AppColors.orange }, 
        pred: { n: "Predicción IA", color: AppColors.violet },
    };
    return (
        <div className="p-3 rounded-xl text-xs shadow-2xl" style={{ background: "#1a1d28", border: `1px solid ${AppColors.border}` }}>
            <p className="mb-2 font-medium" style={{ color: "#64748b" }}>{label}</p>
            {payload.map((p: any) => p.value != null && map[p.dataKey] ? (
                <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
                    <span className="flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: map[p.dataKey].color }} />
                        {map[p.dataKey].n}
                    </span>
                    <span className="font-bold font-mono text-white">{p.value} pzs</span>
                </div>
            ) : null)}
        </div>
    );
};
