"use client";
import { useMemo, useState } from "react";
import { useForm, } from "react-hook-form";
import { Search, Zap, Trash2, CheckCircle2, RefreshCcw, User, Mail, UserMinus, PackageCheck } from "lucide-react";
import { useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { Operario, TipoMaquina } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { OperarioFormData, operarioSchema } from "@/features/operarios/schemas/operario.schema";
import { AppColors } from "@/shared/constants";


const MAQUINAS_OPTIONS: { id: TipoMaquina; label: string; color: string }[] = [
    { id: "merrow", label: "Merrow", color: "#f97316" },
    { id: "cover", label: "Cover", color: "#818cf8" },
    { id: "plana", label: "Plana", color: "#38bdf8" },
    { id: "corte", label: "Corte", color: "#fbbf24" },
    { id: "plancha_dtf", label: "Plancha DTF", color: "#f472b6" },
];

export function ModalGestionOperario({ onClose, operarios }: { onClose: () => void, operarios: Operario[] }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { createOperario, updateOperario, deleteOperario } = useOperarioActions();

    // 1. Inicialización de react-hook-form con tus valores iniciales
    const { register, handleSubmit, setValue, watch, reset, getValues } = useForm<OperarioFormData>({
        resolver: zodResolver(operarioSchema),
        defaultValues: {
            nombre: "",
            apellido: "",
            correo: "",
            estado: "inactivo",
            rol: "operario",
            habilidades: []
        }
    });

    // Observadores para UI reactiva
    const habilidadesWatch = watch("habilidades");
    const estadoWatch = watch("estado");

    const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredOperarios = useMemo(() => {
        return operarios
            .filter(op => op.estado !== "terminado")
            .filter(op =>
                normalizeText(`${op.nombre} ${op.apellido}`)
                    .includes(normalizeText(query))
            )
            .slice(0, 5);
    }, [operarios, query]);

    const toggleMaquina = (maquinaId: TipoMaquina) => {
        const existe = habilidadesWatch.some(h => h.maquina === maquinaId);
        if (existe) {
            setValue("habilidades", habilidadesWatch.filter(h => h.maquina !== maquinaId));
        } else {
            setValue("habilidades", [...habilidadesWatch, { maquina: maquinaId, nivelEficiencia: 0 }]);
        }
    };

    const onActualSubmit = async (data: Operario) => {
        try {
            const operarioId = data.id
            if (isExisting && operarioId) {
                await updateOperario(operarioId, data);
            } else {
                const { id, ...dataToCreate } = data;
                await createOperario(dataToCreate);
            }
            onClose();
        } catch (error) {
            console.error("Error en la operación:", error);
        }
    };

    const handleDelete = async () => {
        const operarioId = getValues("id")
        if (operarioId) {
            try {
                await deleteOperario(operarioId);
                onClose();
            } catch (error) {
                console.error("Error al eliminar operario:", error);
            }
        }
    };

    const onInvalidSubmit = (errors: unknown) => {
        console.error("🚨 Error de Validación en Formulario Operarios:", {
            timestamp: new Date().toISOString(),
            errors, // Aquí verás qué campo falló y por qué (Zod error messages)
            currentValues: getValues()
        });

        // Aquí podrías enviar esto a un servicio externo como Sentry o Logtail
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">

            {showDeleteConfirm && (
                <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-[#1a1f2e] border border-red-500/30 p-6 rounded-2xl max-w-xs text-center shadow-2xl">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-400 w-6 h-6" />
                        </div>
                        <h4 className="text-white font-bold">¿Eliminar Operario?</h4>
                        <p className="text-xs text-slate-400 mt-2">Esta acción borrará todo al operario {getValues("nombre")} de forma permanente.</p>
                        <div className="flex gap-2 mt-6">
                            <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 text-xs text-slate-500 font-bold hover:bg-white/5 rounded-lg">Cancelar</button>
                            <button type="button" onClick={handleDelete} className="flex-1 py-2 text-xs bg-red-500 text-white font-bold rounded-lg shadow-lg">Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onActualSubmit, onInvalidSubmit)}
                className="w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
                style={{ background: AppColors.surface, borderColor: AppColors.border }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: AppColors.border }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <User className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Gestión de Operarios</h2>
                            <p className="text-[11px]" style={{ color: AppColors.slate }}>Panel de RRHH · Meme Fábricas</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '70vh' }}>

                    {/* Buscador Superior */}
                    <div className="space-y-1.5 relative">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Nombre del Operario</label>
                            {!isExisting && query.length > 2 && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in zoom-in duration-300">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Nuevo Operario</span>
                                </div>
                            )}
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setIsOpen(true);
                                    if (!isExisting) {
                                        const partes = e.target.value.trim().split(" ");
                                        setValue("nombre", partes[0] || "");
                                        setValue("apellido", partes.slice(1).join(" ") || "");
                                        setValue("habilidades", []);
                                        setValue("correo", "");
                                    }
                                    if (isExisting) setIsExisting(false);
                                }}
                                onFocus={() => setIsOpen(true)}
                                placeholder="Escribe el nombre completo..."
                                className="w-full h-11 pl-11 pr-10 rounded-xl text-white text-sm focus:outline-none border border-[#1e2130] bg-[#0d1018] focus:border-orange-500/50 transition-all"
                            />
                        </div>

                        {isOpen && filteredOperarios.length > 0 && (
                            <div className="absolute w-full mt-2 py-2 rounded-xl border z-50 shadow-2xl"
                                style={{ background: "#1a1f2e", borderColor: AppColors.border }}>
                                {filteredOperarios.map((op) => (
                                    <button
                                        type="button"
                                        key={op.id}
                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-orange-500/10 flex items-center justify-between group"
                                        onClick={() => {
                                            reset(op);
                                            setQuery(`${op.nombre} ${op.apellido}`);
                                            setIsExisting(true);
                                            setIsOpen(false);
                                        }}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{op.nombre} {op.apellido}</span>
                                        </div>
                                        <RefreshCcw className="w-4 h-4 text-orange-500" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre</label>
                            <input
                                {...register("nombre")}
                                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500/30 pb-1"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Apellido</label>
                            <input
                                {...register("apellido")}
                                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500/30 pb-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-white/5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="ejemplo@memefabrica.com"
                            {...register("correo")}
                            className="w-full bg-transparent text-sm font-medium text-white focus:outline-none border-b border-transparent focus:border-orange-500/30 pb-1"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold px-1 text-slate-400">Estado en Planta</label>
                        <div className="flex gap-2 p-1 rounded-xl bg-[#0d1018] border border-white/5">
                            <button type="button" onClick={() => setValue("estado", "activo")}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 border ${estadoWatch === 'activo'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'text-slate-600 border-transparent hover:border-emerald-500/30 hover:text-slate-400'}`}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVO
                            </button>
                            <button type="button" onClick={() => setValue("estado", "inactivo")}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 border ${estadoWatch === 'inactivo'
                                    ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                    : 'text-slate-600 border-transparent hover:border-slate-500/30 hover:text-slate-400'}`}>
                                <UserMinus className="w-3.5 h-3.5" /> INACTIVO
                            </button>
                            <button type="button" onClick={() => setValue("estado", "terminado")}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 border ${estadoWatch === 'terminado'
                                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                    : 'text-slate-600 border-transparent hover:border-indigo-500/30 hover:text-slate-400'}`}>
                                <PackageCheck className="w-3.5 h-3.5" /> TERMINADO
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-400" /> Estaciones Certificadas
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {MAQUINAS_OPTIONS.map(m => {
                                const activo = habilidadesWatch.some(h => h.maquina === m.id);
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
                                        <div className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                                            style={{ background: activo ? m.color : AppColors.slate }} />

                                        <span className={`text-[11px] font-bold transition-colors ${activo ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                            {m.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-6 py-5 bg-black/20 border-t border-[#1e2130]">
                    <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border border-[#1e2130] text-sm font-semibold text-slate-400 hover:bg-white/5 cursor-pointer">
                        Cancelar
                    </button>
                    <button type="submit" className="flex-[2] h-12 rounded-xl text-white text-sm font-bold shadow-lg cursor-pointer transition-transform active:scale-95" style={{ background: AppColors.orange }}>
                        {isExisting ? "Guardar Cambios" : "Crear Operario"}
                    </button>
                </div>
            </form>
        </div >
    );
}
