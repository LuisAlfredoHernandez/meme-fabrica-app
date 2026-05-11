import { AppColors } from "@/shared/constants";
import { MaquinaStatus } from "@/types";


export function StatusBadge({ status }: { status: MaquinaStatus }) {
    const config = {
        activa: { color: AppColors.emerald, label: "Operativa" },
        inactiva: { color: AppColors.amber, label: "Mantenimiento" },
        depreciada: { color: AppColors.red, label: "Fuera de Servicio" }
    };

    return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 w-fit"
            style={{ background: `${config[status].color}15`, color: config[status].color }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: config[status].color }} />
            {config[status].label}
        </span>
    );
}