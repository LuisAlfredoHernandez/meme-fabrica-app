import { Shield, CheckCircle2, Brain, Clock } from "lucide-react";
import { AppColors } from "../IaShared";

interface MetricasModeloProps {
    status: any;
}

export function MetricasModelo({ status }: MetricasModeloProps) {
    const isCargado = status?.modelo_cargado;
    const algoritmo = status?.algoritmo_activo || "Ninguno";
    const registros = status?.registros_entrenados != null ? `${status.registros_entrenados} ord` : "0 ord";
    const fechaCalib = status?.fecha_calibracion 
        ? new Date(status.fecha_calibracion).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) 
        : "Sin calibrar";

    return (
        <div className="grid grid-cols-2 gap-3">
            {[
                { label: "Modelo Activo", valor: isCargado ? "Calibrado" : "Inactivo", icon: <Shield className="w-4 h-4" />, color: isCargado ? AppColors.emerald : AppColors.amber },
                { label: "Registros Entrenados", valor: registros, icon: <CheckCircle2 className="w-4 h-4" />, color: isCargado ? AppColors.sky : AppColors.slate },
                { label: "Algoritmo Activo", valor: algoritmo, icon: <Brain className="w-4 h-4" />, color: isCargado ? AppColors.violet : AppColors.slate },
                { label: "Última Calibración", valor: fechaCalib, icon: <Clock className="w-4 h-4" />, color: isCargado ? AppColors.emerald : AppColors.slate },
            ].map(m => (
                <div key={m.label} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                    <span className="mt-0.5" style={{ color: m.color }}>{m.icon}</span>
                    <div>
                        <p className="text-xs" style={{ color: AppColors.slate }}>{m.label}</p>
                        <p className="text-sm font-black font-mono mt-0.5" style={{ color: m.color }}>{m.valor}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
