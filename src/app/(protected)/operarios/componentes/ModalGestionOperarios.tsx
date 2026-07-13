"use client";
import { useMemo, useState } from "react";
import { FormProvider, useForm, } from "react-hook-form";
import { Search, RefreshCcw, User, Mail, Trash2 } from "lucide-react";
import { useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { Operario } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { OperarioFormData, operarioSchema } from "@/features/operarios/schemas/operario.schema";
import { AppColors } from "@/shared/constants";
import { StatusSelector } from "./StatusSelector";
import { EstacionesSelector } from "./EstacionesSelector";
import { normalizeText } from "@/utils/formatters";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { useNotificationActions } from "@/shared/store/useNotificationStore";


export function ModalGestionOperario({ onClose, operarios }: { onClose: () => void, operarios: Operario[] }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { createOperario, updateOperario, deleteOperario } = useOperarioActions();
    const { addToastOnly } = useNotificationActions();

    const methods = useForm<OperarioFormData>({
        resolver: zodResolver(operarioSchema),
        defaultValues: {
            nombre: "",
            apellido: "",
            correo: "",
            estado: "inactivo",
            rol: "operario",
            password: "",
            maquinaActual: "" as any,
            habilidades: []
        }
    });

    const { register, handleSubmit, setValue, reset, getValues, formState: { errors } } = methods

    const filteredOperarios = useMemo(() => {
        return operarios
            .filter(op => op.estado !== "terminado")
            .filter(op =>
                normalizeText(`${op.nombre} ${op.apellido}`)
                    .includes(normalizeText(query))
            )
            .slice(0, 5);
    }, [operarios, query]);


    const onActualSubmit = async (data: OperarioFormData) => {
        try {
            if (isExisting && data.id) {
                await updateOperario(data.id, data as Operario);
                addToastOnly("Operario Actualizado", `Datos de ${data.nombre} actualizados con éxito.`, "success");
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...dataToCreate } = data;
                await createOperario(dataToCreate as Omit<Operario, "id">);
                addToastOnly("Operario Creado", `Operario ${data.nombre} registrado con éxito.`, "success");
            }
            onClose();
        } catch (error: any) {
            console.error("Error en la operación:", error);
            addToastOnly("Error de Operario", error.message || "No se pudo procesar la operación.", "error");
        }
    };

    const handleDelete = async () => {
        const operarioId = getValues("id")
        if (operarioId) {
            try {
                await deleteOperario(operarioId);
                addToastOnly("Operario Eliminado", "Operario eliminado exitosamente del sistema.", "success");
                onClose();
            } catch (error: any) {
                console.error("Error al eliminar operario:", error);
                addToastOnly("Error al Eliminar", error.message || "No se pudo eliminar al operario.", "error");
            }
        }
    };

    const onInvalidSubmit = (errors: unknown) => {
        console.error("🚨 Error de Validación en Formulario Operarios:", {
            timestamp: new Date().toISOString(),
            errors, // Aquí verás qué campo falló y por qué (Zod error messages)
            currentValues: getValues()
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    title="¿Eliminar Operario?"
                    description={
                        <>
                            Esta acción borrará todo al operario <strong className="text-white">{getValues("nombre")}</strong> de forma permanente.
                        </>
                    }
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                />
            )}
            <FormProvider {...methods}>
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
                                {errors.nombre && (
                                    <p className="text-[10px] text-red-400 mt-1">{errors.nombre.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Apellido</label>
                                <input
                                    {...register("apellido")}
                                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500/30 pb-1"
                                />
                                {errors.apellido && (
                                    <p className="text-[10px] text-red-400 mt-1">{errors.apellido.message}</p>
                                )}
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
                            {errors.correo && (
                                <p className="text-[10px] text-red-400 mt-1">{errors.correo.message}</p>
                            )}
                        </div>

                        {!isExisting && (
                            <div className="space-y-1 pt-2 border-t border-white/5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    placeholder="Contraseña del operario"
                                    required
                                    {...register("password")}
                                    className="w-full bg-transparent text-sm font-medium text-white focus:outline-none border-b border-transparent focus:border-orange-500/30 pb-1"
                                />
                                {errors.password && (
                                    <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>
                                )}
                            </div>
                        )}

                        {/* Selector de estados del formulario */}
                        <StatusSelector />

                        {/* Selector de estaciones del operador */}
                        <EstacionesSelector />
                        {errors.habilidades && (
                            <p className="text-[10px] text-red-400 mt-1 px-1">{errors.habilidades.message}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 px-6 py-5 bg-black/20 border-t border-[#1e2130]">
                        {isExisting && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 h-12 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center justify-center"
                                title="Eliminar Operario"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border border-[#1e2130] text-sm font-semibold text-slate-400 hover:bg-white/5 cursor-pointer">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-[2] h-12 rounded-xl text-white text-sm font-bold shadow-lg cursor-pointer transition-transform active:scale-95" style={{ background: AppColors.orange }}>
                            {isExisting ? "Guardar Cambios" : "Crear Operario"}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </div >
    );
}
