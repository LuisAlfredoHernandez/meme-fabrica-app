"use client";
import { useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Search, PlusCircle, MinusCircle, Trash2, RefreshCcw, AlertCircle } from "lucide-react";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { normalizeText } from "@/utils/formatters";
import { AppColors } from "@/shared/constants";
import { Insumo } from "@/types";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { insumoSchema, InsumoFormData } from "@/features/insumos/schemas/insumos.schemas";

type OperationMode = "entrada" | "salida" | "eliminar";

export function ModalGestionInsumo({ onClose }: { onClose: () => void }) {
    const { insumos } = useInsumosStore();
    const { createInsumo, updateInsumo, deleteInsumo } = useInsumosActions();
    const { addToastOnly } = useNotificationActions();

    // Estados de UI
    const [mode, setMode] = useState<OperationMode>("entrada");
    const [showConfirm, setShowConfirm] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    // Almacena los datos válidos si el usuario debe confirmar la acción
    const [pendingData, setPendingData] = useState<InsumoFormData | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Inicialización de React Hook Form
    const { register, handleSubmit, setValue, watch, getValues, reset, formState: { errors } } = useForm<InsumoFormData>({
        resolver: zodResolver(insumoSchema),
        defaultValues: {
            nombre: "", tipo: "tela", unidad: "metros", stock: 0, minimo: 0, proveedor: "", codigo: ""
        }
    });

    // Observamos campos críticos para la UI reactiva
    const query = watch("nombre") || "";
    const cantidadWatch = watch("stock") || 0;
    const tipoWatch = watch("tipo");

    // Filtrar insumos existentes
    const filteredInsumos = useMemo(() => {
        if (!query || isExisting) return [];
        return insumos.filter(insumo =>
            normalizeText(insumo.nombre).includes(normalizeText(query))
        ).slice(0, 10);
    }, [insumos, query, isExisting]);

    const generarCodigo = () => {
        const prefix = tipoWatch === "tela" ? "TEL" : tipoWatch === "otro" ? "ACC" : "UKN";
        const maxValue = Math.max(...insumos.map(x => Number(x.codigo?.split("-")[1]) || 0)) + 1;
        return `${prefix}-${String(maxValue).padStart(3, '0')}`;
    };

    // Función principal de ejecución (después de validar o confirmar)
    const executeAction = async (data: InsumoFormData) => {
        try {
            if (isExisting) {
                const original = insumos.find(i => i.id === data.id);
                const stockActual = Number(original?.stock || 0);

                const nuevoStock = mode === "entrada"
                    ? stockActual + data.stock
                    : Math.max(0, stockActual - data.stock);

                await updateInsumo(data.id as string, { stock: nuevoStock });
                addToastOnly("Stock Actualizado", `Inventario modificado para ${data.nombre}.`, "success");
            } else {
                await createInsumo({
                    ...data,
                    stock: data.stock || 0,
                    codigo: generarCodigo()
                } as Insumo);
                addToastOnly("Insumo Creado", `Insumo ${data.nombre} añadido al inventario.`, "success");
            }
            onClose();
        } catch (error: any) {
            console.error("Error al procesar insumo:", error);
            addToastOnly("Error de Inventario", error.message || "No se pudo actualizar el insumo.", "error");
        }
    };

    // Handler del Formulario (Solo se ejecuta si Zod aprueba la validación)
    const onSubmitAction = (data: InsumoFormData) => {
        console.log("executed")
        if (mode === "salida") {
            setPendingData(data);
            setShowConfirm(true); // Requiere confirmación
        } else {
            executeAction(data); // Entrada directa
        }
    };

    const handleEliminar = async () => {
        const id = getValues("id");
        if (id) {
            try {
                await deleteInsumo(id);
                addToastOnly("Insumo Eliminado", "Insumo eliminado exitosamente del inventario.", "success");
                onClose();
            } catch (error: any) {
                console.error("Error al eliminar insumo:", error);
                addToastOnly("Error al Eliminar", error.message || "No se pudo eliminar el insumo.", "error");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Modal de Confirmación */}
            {showConfirm && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl">
                    <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl max-w-xs text-center shadow-2xl">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-400 w-6 h-6" />
                        </div>
                        <h4 className="text-white font-bold">¿Confirmar {mode}?</h4>
                        <p className="text-xs text-slate-400 mt-2">
                            {mode === "eliminar"
                                ? "Se borrará el registro completo de la base de datos."
                                : `Se retirarán ${cantidadWatch} unidades del inventario.`}
                        </p>
                        <div className="flex gap-2 mt-6">
                            <button type="button" onClick={() => setShowConfirm(false)} className="flex-1 py-2 text-xs text-slate-400 font-bold hover:bg-white/5 rounded-lg">Atrás</button>
                            <button type="button" onClick={() => mode === "eliminar" ? handleEliminar() : pendingData && executeAction(pendingData)} className="flex-1 py-2 text-xs bg-red-500 text-white font-bold rounded-lg shadow-lg">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmitAction, (err) => console.log("Errores de validación del formulario:", err))}
                className="w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
                style={{ background: AppColors.surface, borderColor: AppColors.border }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: AppColors.border }}>
                    <div>
                        <h2 className="font-bold text-white text-lg">Movimiento de Stock</h2>
                        <p className="text-[11px]" style={{ color: AppColors.slate }}>Gestión de inventario Meme Fábricas</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors" style={{ color: AppColors.slate }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '80vh' }}>

                    {/* SELECTOR DE MODO */}
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: AppColors.inputBg }}>
                        <button type="button" onClick={() => setMode("entrada")}
                            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === "entrada" ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                            <PlusCircle className="w-4 h-4" /> Entrada
                        </button>
                        <button type="button" onClick={() => isExisting && setMode("salida")} disabled={!isExisting}
                            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!isExisting ? 'opacity-20 cursor-not-allowed' : 'hover:text-slate-300'} ${mode === "salida" ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-500'}`}>
                            <MinusCircle className="w-4 h-4" /> Salida
                        </button>
                        <button type="button" onClick={() => isExisting && setMode("eliminar")} disabled={!isExisting}
                            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!isExisting ? 'opacity-20 cursor-not-allowed' : 'hover:text-slate-300'} ${mode === "eliminar" ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-500'}`}>
                            <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                    </div>

                    {/* BUSCADOR DE INSUMO */}
                    <div className="space-y-1.5 relative" ref={containerRef}>
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Nombre del Insumo</label>
                            {!isExisting && query.length > 2 && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Nuevo Insumo</span>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isOpen ? AppColors.orange : AppColors.slate }} />
                            <input
                                {...register("nombre")}
                                onChange={(e) => {
                                    setValue("nombre", e.target.value, { shouldValidate: true });
                                    setIsOpen(true);
                                    if (isExisting) {
                                        setIsExisting(false);
                                        setMode("entrada");
                                    }
                                }}
                                onFocus={() => setIsOpen(true)}
                                placeholder="Escribe para buscar o crear..."
                                className="w-full h-11 pl-11 pr-10 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                style={{
                                    background: AppColors.inputBg,
                                    borderColor: errors.nombre ? AppColors.red : (!isExisting && query.length > 2 ? `${AppColors.emerald}40` : (isOpen ? AppColors.orange : AppColors.border))
                                }}
                            />
                            {errors.nombre && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-red-400">{errors.nombre.message}</span>}
                        </div>

                        {/* DROPDOWN AUTOCUMPLETAR */}
                        {isOpen && filteredInsumos.length > 0 && (
                            <div className="absolute w-full mt-2 py-2 rounded-xl border z-50 shadow-2xl" style={{ background: "#1a1f2e", borderColor: AppColors.border }}>
                                {filteredInsumos.map((ins) => (
                                    <button
                                        type="button"
                                        key={ins.id}
                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-orange-500/10 flex items-center justify-between group"
                                        onClick={() => {
                                            reset({
                                                id: ins.id,
                                                nombre: ins.nombre,
                                                tipo: ins.tipo,
                                                unidad: ins.unidad,
                                                stock: 0,
                                                minimo: ins.minimo,
                                                proveedor: ins.proveedor ?? "",
                                                codigo: ins.codigo ?? ""
                                            });
                                            setIsExisting(true);
                                            setIsOpen(false);
                                        }}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{ins.nombre}</span>
                                            <span className="text-[10px]" style={{ color: AppColors.slate }}>Stock Actual: {ins.stock} {ins.unidad}</span>
                                        </div>
                                        <RefreshCcw className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN DINÁMICA */}
                    {mode !== "eliminar" ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Tipo</label>
                                    <select {...register("tipo")} disabled={isExisting} className={`w-full h-11 px-3 rounded-xl text-sm text-white border ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: AppColors.inputBg, borderColor: AppColors.border }}>
                                        <option value="tela">Tela</option>
                                        <option value="accesorio">Accesorio</option>
                                        <option value="zipper">Zipper</option>
                                        <option value="hilo">Hilo</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Unidad</label>
                                    <select {...register("unidad")} disabled={isExisting} className={`w-full h-11 px-3 rounded-xl text-sm text-white border ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: AppColors.inputBg, borderColor: AppColors.border }}>
                                        {["metros", "unidades", "rollos", "kg"].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: mode === "entrada" ? AppColors.emerald : AppColors.orange }}>
                                        Cantidad a {mode === "entrada" ? "sumar" : "retirar"}
                                    </label>
                                    <input type="number" {...register("stock", { valueAsNumber: true })}
                                        className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                        style={{ background: AppColors.inputBg, borderColor: errors.stock ? AppColors.red : (cantidadWatch > 0 ? (mode === "entrada" ? AppColors.emerald : AppColors.orange) : AppColors.border) }} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Mínimo Crítico</label>
                                    <input type="number" {...register("minimo", { valueAsNumber: true })} disabled={isExisting}
                                        className={`w-full h-11 px-4 rounded-xl text-white text-sm border ${isExisting ? 'opacity-50' : ''}`}
                                        style={{ background: AppColors.inputBg, borderColor: AppColors.border }} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center gap-3">
                            <Trash2 className="text-red-400 w-5 h-5 flex-shrink-0" />
                            <p className="text-xs text-red-200">Se eliminará el insumo <b>{query}</b> y todo su historial de stock. Esta acción es irreversible.</p>
                        </div>
                    )}

                    {mode === "entrada" && !isExisting && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Proveedor</label>
                            <input {...register("proveedor")} placeholder="Nombre del proveedor"
                                className="w-full h-11 px-4 rounded-xl text-white text-sm border"
                                style={{ background: AppColors.inputBg, borderColor: AppColors.border }} />
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex gap-3 px-6 py-5 bg-black/20 border-t" style={{ borderColor: AppColors.border }}>
                    <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border text-sm font-semibold text-slate-400 hover:bg-white/5 transition-colors" style={{ borderColor: AppColors.border }}>
                        Cancelar
                    </button>
                    {mode === "eliminar" ? (
                        // Botón especial para Eliminar (No hace submit al formulario)
                        <button type="button" onClick={() => setShowConfirm(true)} className="flex-1 h-12 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95 bg-red-500">
                            Eliminar Todo
                        </button>
                    ) : (
                        // Botón Submit para Entrada / Salida
                        <button type="submit" className="flex-1 h-12 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95"
                            style={{ background: mode === "entrada" ? AppColors.emerald : AppColors.orange }}>
                            {mode === "entrada" ? "Registrar Entrada" : "Retirar Stock"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}