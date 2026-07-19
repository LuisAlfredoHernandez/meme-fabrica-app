import { AppColors } from "@/shared/constants";
import { MaquinaStatus } from "@/types";

export function StatusBadge({ status }: { status: MaquinaStatus }) {
    const config: Record<MaquinaStatus, { color: string; label: string; isPulse?: boolean }> = {
        operativa: { color: AppColors.emerald, label: "Operativa" },
        bajo_revision: { color: "#fbbf24", label: "Revisión", isPulse: true },
        mantenimiento: { color: AppColors.amber, label: "Mantenimiento" },
        fuera_servicio: { color: AppColors.red, label: "Fuera de Servicio" }
    };

    const cfg = config[status] || config.operativa;

    return (
        <span
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 w-fit transition-all"
            style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.isPulse ? 'animate-ping' : ''}`} style={{ background: cfg.color }} />
            {cfg.label}
        </span>
    );
}