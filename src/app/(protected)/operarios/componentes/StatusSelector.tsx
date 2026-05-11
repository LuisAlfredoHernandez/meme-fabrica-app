import { useFormContext, useController } from "react-hook-form";
import { CheckCircle2, UserMinus, PackageCheck } from "lucide-react";
import { OperarioFormData } from "@/features/operarios/schemas/operario.schema";

const STATUS_STYLES = {
    activo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactivo: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    terminado: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const hoverStyles = {
    activo: "hover:border-emerald-500/30",
    inactivo: "hover:border-slate-500/30",
    terminado: "hover:border-indigo-500/30",
};

export function StatusSelector() {
    const { control } = useFormContext<OperarioFormData>();

    const { field } = useController({
        name: "estado",
        control,
    });

    const states = [
        { id: "activo", label: "ACTIVO", icon: CheckCircle2, color: "emerald" },
        { id: "inactivo", label: "INACTIVO", icon: UserMinus, color: "slate" },
        { id: "terminado", label: "TERMINADO", icon: PackageCheck, color: "indigo" },
    ] as const;

    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold px-1 text-slate-400">Estado en Planta</label>
            <div className="flex gap-2 p-1 rounded-xl bg-[#0d1018] border border-white/5">
                {states.map(({ id, label, icon: Icon }) => {
                    const isActive = field.value === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => field.onChange(id)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 border 
                                ${isActive
                                    ? STATUS_STYLES[id]
                                    : `text-slate-600 border-transparent ${hoverStyles[id]} hover:text-slate-400`}`}
                        >
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}