"use client";

import { OrdenFormData, ordenSchema } from "@/features/ordenes/schemas/ordenes.schemas";
import { useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { getPrendasAction } from "@/features/ordenes/actions/ordenes.actions";
import { AppColors } from "@/shared/constants";
import { Orden } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { predictOrderItemsAction } from "@/features/ia-predictiva/actions/ia.actions";
import { useNotificationActions } from "@/shared/store/useNotificationStore";


export function ModalGestionOrdenes({ orden, onClose }: { onClose: () => void, orden?: Orden; }) {

    const { register, handleSubmit, watch, setValue, control, getValues, reset, formState: { errors } } = useForm<OrdenFormData>({
        resolver: zodResolver(ordenSchema),
        defaultValues: {
            tipo: "MTO",
            prioridad: "normal",
            cliente: "",
            numero: "ORD-" + new Date().getFullYear() + "-",
            estado: "pendiente",
            lineas: [{ descripcion: "", cantidad: 1, talla: "M", color: "", insumos: [] }],
            fechaEntregaEstimada: ""
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "lineas" });
    const { createOrden, updateOrden } = useOrdenActions()
    const isEdit = !!orden;
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [listaPrendas, setListaPrendas] = useState<string[]>([]);
    const COLORES_SUGERIDOS = ["Negro", "Blanco", "Azul Marino", "Gris", "Rojo", "Verde", "Amarillo", "Rosa", "Naranja", "Beige", "Celeste", "Vino"];

    const [estimandoIA, setEstimandoIA] = useState(false);
    const { addToastOnly } = useNotificationActions();

    const sugerirFechaConIA = async () => {
        const lineas = getValues("lineas");
        const prioridad = getValues("prioridad");
        
        if (!lineas || lineas.length === 0 || lineas.some(l => !l.descripcion)) {
            addToastOnly("Error de Simulación", "Por favor ingrese las prendas y cantidades antes de estimar.", "error");
            return;
        }

        setEstimandoIA(true);
        try {
            const items = lineas.map(l => ({
                tipo_prenda: l.descripcion.trim(),
                cantidad_piezas: Number(l.cantidad) || 1
            }));

            const prioridadAlta = prioridad === "alta" || prioridad === "urgente";
            
            const res = await predictOrderItemsAction(items, prioridadAlta, 1);

            if (res.prenda_nueva_global) {
                const prendaNueva = res.detalles.find((d: any) => d.prenda_nueva)?.tipo_prenda || "desconocida";
                addToastOnly(
                    "IA: Prenda Nueva Detectada",
                    `La prenda "${prendaNueva}" no cuenta con historial de costura. Estimación no disponible por seguridad.`,
                    "warning"
                );
            } else if (res.tiempo_estimado_total_horas !== null) {
                const horas = res.tiempo_estimado_total_horas;
                const diasLaborables = Math.ceil(horas / 8);
                
                const fechaSugerida = new Date();
                fechaSugerida.setDate(fechaSugerida.getDate() + diasLaborables);
                
                const fechaFormat = fechaSugerida.toISOString().split("T")[0];
                setValue("fechaEntregaEstimada", fechaFormat);
                
                addToastOnly(
                    "IA: Fecha Sugerida",
                    `Se sugirió entrega en ${diasLaborables} días base a ${horas} horas estimadas de costura.`,
                    "success"
                );
            } else {
                throw new Error("No se pudo obtener el tiempo estimado.");
            }
        } catch (e: any) {
            console.error("Fallo al estimar fecha con IA:", e);
            addToastOnly("Error de IA", e.message || "Fallo al conectar con el motor de IA.", "error");
        } finally {
            setEstimandoIA(false);
        }
    };

    useEffect(() => {
        const cargarPrendas = async () => {
            try {
                const list = await getPrendasAction();
                setListaPrendas(list);
            } catch (e) {
                console.error("Error al cargar prendas de la BD:", e);
            }
        };
        cargarPrendas();
    }, []);

    const vTipo = watch("tipo");
    const vCliente = watch("cliente");
    const vFechaEntrega = watch("fechaEntregaEstimada");
    const vLineas = watch("lineas");

    useEffect(() => {
        if (orden) {
            reset(orden); // Esto limpia el formulario y carga los datos de la orden a editar
        }
    }, [orden, reset]);

    const onActualSubmit = async (data: OrdenFormData) => {
        try {
            if (isEdit && orden?.id) {
                await updateOrden(orden.id, data as Orden);
                console.log("Orden actualizada exitosamente");
            } else {
                await createOrden(data as Orden);
                console.log("Orden creada exitosamente");
            }
            onClose();
        } catch (error) {
            console.error("Error al procesar la operación:", error);
        }
    };

    const onInvalidSubmit = (errors: unknown) => {
        console.error("🚨 Error de Validación en Formulario Operarios:", {
            timestamp: new Date().toISOString(),
            errors,
            currentValues: getValues()
        });
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>

            <style>{`
                .order-items-scroll::-webkit-scrollbar { width: 5px; }
                .order-items-scroll::-webkit-scrollbar-track { background: transparent; }
                .order-items-scroll::-webkit-scrollbar-thumb { 
                    background: ${AppColors.border}; 
                    border-radius: 10px; 
                }
                .order-items-scroll::-webkit-scrollbar-thumb:hover { background: ${AppColors.orange}80; }
                
                /* Máscara de desvanecimiento para el scroll */
                .scroll-mask {
                    mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
                }
            `}</style>

            <form onSubmit={handleSubmit(onActualSubmit, onInvalidSubmit)}
                className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: AppColors.border }}>
                    <h2 className="font-bold text-white text-lg">Nueva Orden de Producción</h2>
                    <button type="button" onClick={onClose} style={{ color: AppColors.slate }}
                        className="hover:bg-red-500/10 hover:rotate-90 transition-transform duration-200 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-hidden flex-1 flex flex-col">
                    {/* Sección Fija: Datos Generales */}
                    <div className="space-y-4 shrink-0">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Tipo de Orden</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["MTO", "MTS"] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setValue("tipo", t)}
                                        className="py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer"
                                        style={{
                                            borderColor: vTipo === t ? AppColors.orange : AppColors.border,
                                            color: vTipo === t ? AppColors.orange : "#94a3b8",
                                            background: vTipo === t ? `${AppColors.orange}15` : "transparent",
                                        }}>
                                        {t === "MTO" ? "MTO — Pedido" : "MTS — Stock"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                                {vTipo === "MTO" ? "Cliente" : "Descripción del Lote"}
                            </label>
                            <input {...register("cliente")}
                                placeholder="..."
                                className="w-full h-11 px-4 rounded-xl text-white text-sm bg-black/20 focus:outline-none transition-all"
                                style={{ border: `1.5px solid ${errors.cliente ? AppColors.red : (vCliente ? AppColors.orange : AppColors.border)}` }} />
                            {errors.cliente && (
                                <p className="text-xs text-red-400 mt-0.5">{errors.cliente.message}</p>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN DE PRENDAS (Con Scroll Homogéneo) */}
                    <div className="flex flex-col flex-1 min-h-0 space-y-3 relative">
                        <div className="flex justify-between items-center px-1 shrink-0">
                            <label className="text-[11px] font-black uppercase tracking-widest text-orange-500">Prendas / Items</label>
                            <button type="button" onClick={() => append({ descripcion: "", cantidad: 1, talla: "M", color: "", insumos: [] })}
                                className="group flex items-center justify-center p-1 rounded-lg border border-orange-500/30 hover:bg-orange-500/10 cursor-pointer transition-all">
                                <Plus className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        {errors.lineas?.message && (
                            <p className="text-xs text-red-400 px-1 mt-0.5">{errors.lineas.message}</p>
                        )}

                        {/* Área de Scroll con Máscara Visual */}
                        <div className="flex-1 overflow-hidden relative scroll-mask">
                            <div className="order-items-scroll h-full overflow-y-auto pr-3 space-y-4 py-4" style={{ maxHeight: "320px" }}>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 rounded-2xl border space-y-4 transition-all duration-300 hover:bg-white/[0.02]"
                                        style={{ borderColor: AppColors.border, background: "rgba(255,255,255,0.01)" }}>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="ej: Camiseta, Jogger..."
                                                    list={`prendas-datalist-${index}`}
                                                    {...register(`lineas.${index}.descripcion`)}
                                                    className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/20 focus:outline-none transition-all placeholder-slate-600 focus:border-orange-500/50"
                                                    style={{ border: `1.5px solid ${errors.lineas?.[index]?.descripcion ? AppColors.red : (vLineas[index]?.descripcion ? AppColors.orange : AppColors.border)}` }}
                                                    autoComplete="off"
                                                />
                                                {errors.lineas?.[index]?.descripcion && (
                                                    <p className="text-xs text-red-400 mt-1">{errors.lineas[index]?.descripcion?.message}</p>
                                                )}
                                                <datalist id={`prendas-datalist-${index}`}>
                                                    {listaPrendas.map(p => <option key={p} value={p} />)}
                                                </datalist>
                                            </div>

                                            {fields.length > 1 && (
                                                <button type="button" onClick={() => remove(index)}
                                                    className="flex items-center justify-center rounded-xl bg-[#0d1018] text-slate-600 hover:bg-red-400 transition-all duration-300 group cursor-pointer">
                                                    <Trash2 className="w-10 h-5 group-hover:scale-110 transition-transform" /> </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Talla</span>
                                                <select {...register(`lineas.${index}.talla`)}
                                                    className="w-full h-10 px-2 rounded-xl text-xs text-white bg-black/20 border border-[#1e2130] focus:border-orange-500/50 outline-none">
                                                    {["XS", "S", "M", "L", "XL", "MIXTA", "PREDETERMINADA"].map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1 relative">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Color</span>
                                                <input
                                                    type="text"
                                                    placeholder="ej: Negro"
                                                    {...register(`lineas.${index}.color`)}
                                                    onFocus={() => setFocusedIndex(index)}
                                                    onBlur={() => setFocusedIndex(null)}
                                                    className="w-full h-10 px-3 rounded-xl text-white text-xs bg-black/20 focus:outline-none placeholder-slate-600 border focus:border-orange-500/50"
                                                    style={{ borderColor: AppColors.border }}
                                                    autoComplete="off"
                                                />

                                                {focusedIndex === index && (
                                                    <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-[#13161e] border border-[#1e2130] rounded-xl z-50 shadow-2xl custom-scrollbar">
                                                        {COLORES_SUGERIDOS
                                                            .filter(c => {
                                                                const val = vLineas[index]?.color || "";
                                                                return c.toLowerCase().includes(val.toLowerCase());
                                                            })
                                                            .map(c => (
                                                                <button
                                                                    key={c}
                                                                    type="button"
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        setValue(`lineas.${index}.color`, c);
                                                                        setFocusedIndex(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-orange-500/10 hover:text-white transition-colors cursor-pointer"
                                                                >
                                                                    {c}
                                                                </button>
                                                            ))}
                                                        {/* Opción para sugerir que sigan escribiendo */}
                                                        {vLineas[index]?.color && !COLORES_SUGERIDOS.map(c => c.toLowerCase()).includes((vLineas[index]?.color || "").toLowerCase()) && (
                                                            <div className="px-3 py-1.5 text-[9px] text-slate-500 border-t border-[#1e2130]">
                                                                Usa el color escrito: "{vLineas[index]?.color}"
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase ml-1 tracking-tighter">Cantidad</span>
                                                <input type="number" {...register(`lineas.${index}.cantidad`, { valueAsNumber: true })}
                                                    className="w-full h-10 px-3 rounded-xl text-white text-xs bg-black/20 focus:outline-none"
                                                    style={{ border: `1.5px solid ${errors.lineas?.[index]?.cantidad ? AppColors.red : (vLineas[index]?.cantidad > 0 ? AppColors.orange : AppColors.border)}` }} />
                                                {errors.lineas?.[index]?.cantidad && (
                                                    <p className="text-[10px] text-red-400 mt-1">{errors.lineas[index]?.cantidad?.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Interno: Prioridad y Fecha */}
                    <div className="grid grid-cols-2 gap-4 pt-2 shrink-0 border-t" style={{ borderColor: AppColors.border }}>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Prioridad</label>
                            <select {...register("prioridad")}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white bg-black/20 focus:outline-none border border-[#1e2130]">
                                {["baja", "normal", "alta", "urgente"].map(p =>
                                    <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5 shrink-0">
                            <div className="flex justify-between items-center pr-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Fecha Entrega</label>
                                <button
                                    type="button"
                                    onClick={sugerirFechaConIA}
                                    disabled={estimandoIA}
                                    className="text-[9px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    style={{ color: AppColors.orange }}
                                >
                                    {estimandoIA ? "Calculando..." : "✨ Sugerir con IA"}
                                </button>
                            </div>
                            <div className="relative group h-11">
                                <Calendar
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none z-30 ${vFechaEntrega ? 'text-orange-500' : 'text-slate-500'}`}
                                />

                                {/* Input de tipo date real (oculto en términos de texto pero clickeable encima) */}
                                <input
                                    type="date"
                                    {...register("fechaEntregaEstimada")}
                                    className="date-input-custom absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
                                />

                                {/* Contenedor visual que muestra el formato DD-MM-YYYY */}
                                <div
                                    className="absolute inset-0 w-full h-full pl-11 pr-4 rounded-xl text-white text-sm bg-black/20 flex items-center border transition-all pointer-events-none z-20"
                                    style={{
                                        borderColor: errors.fechaEntregaEstimada ? AppColors.red : (vFechaEntrega ? AppColors.orange : AppColors.border)
                                    }}
                                >
                                    {vFechaEntrega ? (
                                        vFechaEntrega.split("-").reverse().join("-")
                                    ) : (
                                        <span className="text-slate-500">Seleccionar fecha...</span>
                                    )}
                                </div>
                            </div>
                            {errors.fechaEntregaEstimada && (
                                <p className="text-[10px] text-red-400 mt-1">{errors.fechaEntregaEstimada.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Principal */}
                <div className="flex gap-3 px-6 py-6 border-t shrink-0 bg-black/40" style={{ borderColor: AppColors.border }}>
                    <button type="button" onClick={onClose}
                        className="flex-1 h-12 rounded-xl border border-white/5 text-sm font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
                        CANCELAR
                    </button>
                    <button type="submit"
                        className="flex-[2] h-12 rounded-xl text-white text-xs font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                        style={{ background: AppColors.orange, boxShadow: `0 8px 24px -8px ${AppColors.orange}60` }}>
                        CONFIRMAR ORDEN
                    </button>
                </div>
            </form>
        </div>
    );
}