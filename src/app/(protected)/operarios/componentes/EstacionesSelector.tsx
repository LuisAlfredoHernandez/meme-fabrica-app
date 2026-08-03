import { useFormContext, useController } from "react-hook-form";
import { Zap } from "lucide-react";
import { OperarioFormData } from "@/features/operarios/schemas/operario.schema";
import { TipoMaquina } from "@/types";
import { AppColors } from "@/shared/constants";

const MAQUINAS_OPTIONS: { id: TipoMaquina; label: string; color: string }[] = [
    { id: "merrow", label: "Merrow", color: "#f97316" },
    { id: "cover", label: "Cover", color: "#818cf8" },
    { id: "plana", label: "Plana", color: "#38bdf8" },
    { id: "corte", label: "Corte", color: "#fbbf24" },
    { id: "plancha_dtf", label: "Plancha DTF", color: "#f472b6" },
];

export function EstacionesSelector() {
    const { control } = useFormContext<OperarioFormData>();

    const { field } = useController({
        name: "habilidades",
        control,
        defaultValue: []
    });

    const habilidades = field.value || [];

    const toggleMaquina = (maquinaId: TipoMaquina) => {
        const existe = habilidades.some(h => h.maquina === maquinaId);
        const nuevasHabilidades = existe
            ? habilidades.filter(h => h.maquina !== maquinaId)
            : [...habilidades, { maquina: maquinaId, nivel_eficiencia: 0 }];

        field.onChange(nuevasHabilidades);
    };

    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-400" /> Estaciones Certificadas
            </label>
            <div className="grid grid-cols-2 gap-2">
                {MAQUINAS_OPTIONS.map(m => {
                    const activo = habilidades.some(h => h.maquina === m.id);
                    return (
                        <button
                            type="button"
                            key={m.id}
                            onClick={() => toggleMaquina(m.id)}
                            className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all group"
                            style={{
                                borderColor: activo ? m.color : 'transparent',
                                background: activo ? `${m.color}15` : "#0d1018",
                            }}
                            onMouseEnter={(e) => {
                                if (!activo) e.currentTarget.style.borderColor = `${m.color}40`;
                            }}
                            onMouseLeave={(e) => {
                                if (!activo) e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <div
                                className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                                style={{ background: activo ? m.color : AppColors.slate }}
                            />

                            <span className={`text-[11px] font-bold transition-colors ${activo ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {m.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}