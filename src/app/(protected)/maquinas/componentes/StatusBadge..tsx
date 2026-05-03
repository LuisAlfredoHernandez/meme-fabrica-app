import { MaquinaStatus } from "@/types";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", slate: "#475569", inputBg: "#0d1018"
};

export function StatusBadge({ status }: { status: MaquinaStatus }) {
    const config = {
        activa: { color: C.emerald, label: "Operativa" },
        inactiva: { color: C.amber, label: "Mantenimiento" },
        depreciada: { color: C.red, label: "Fuera de Servicio" }
    };

    return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 w-fit"
            style={{ background: `${config[status].color}15`, color: config[status].color }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: config[status].color }} />
            {config[status].label}
        </span>
    );
}