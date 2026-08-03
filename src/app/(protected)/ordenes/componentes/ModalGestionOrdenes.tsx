"use client";

import { OrdenFormData, ordenSchema } from "@/features/ordenes/schemas/ordenes.schemas";
import { useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { getPrendasAction } from "@/features/ordenes/actions/ordenes.actions";
import { AppColors } from "@/shared/constants";
import { Orden, MAQUINAS_LIST } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { predictOrderItemsAction } from "@/features/ia-predictiva/actions/ia.actions";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { useOperarioStore, useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { CardLineaOrden } from "./CardLineaOrden";


export function ModalGestionOrdenes({ orden, onClose, readOnly = false }: { onClose: () => void; orden?: Orden; readOnly?: boolean; }) {

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
    const { fields: asigFields, append: appendAsig, remove: removeAsig } = useFieldArray({ control, name: "asignaciones" });
    const { createOrden, updateOrden } = useOrdenActions();
    const { insumos } = useInsumosStore();
    const { fetchInsumos } = useInsumosActions();
    const { operarios } = useOperarioStore();
    const { fetchOperarios } = useOperarioActions();
    const isEdit = !!orden;
    const [listaPrendas, setListaPrendas] = useState<string[]>([]);

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
        fetchInsumos();
        fetchOperarios();
    }, [fetchInsumos, fetchOperarios]);

    const vTipo = watch("tipo");
    const vCliente = watch("cliente");
    const vFechaEntrega = watch("fechaEntregaEstimada");
    const vLineas = watch("lineas");
    const vAsignaciones = watch("asignaciones");

    useEffect(() => {
        if (orden) {
            reset(orden); // Esto limpia el formulario y carga los datos de la orden a editar
        }
    }, [orden, reset]);

    const onActualSubmit = async (data: OrdenFormData) => {
        try {
            if (isEdit && orden?.id) {
                await updateOrden(orden.id, data as Orden);
                addToastOnly("Orden Actualizada", "La orden fue modificada con éxito.", "success");
            } else {
                await createOrden(data as Orden);
                addToastOnly("Orden Creada", "La orden fue registrada con éxito.", "success");
            }
            onClose();
        } catch (error: any) {
            console.error("Error al procesar la operación:", error);
            addToastOnly("Error al Guardar", error.message || "No se pudo guardar la orden.", "error");
        }
    };

    const onInvalidSubmit = (errors: any) => {
        console.error("🚨 Error de Validación en Formulario Ordenes:", {
            timestamp: new Date().toISOString(),
            errors,
            currentValues: getValues()
        });

        Object.entries(errors).forEach(([field, error]: [string, any]) => {
            let mensaje = error.message;
            if (!mensaje && error.root) mensaje = error.root.message;
            if (!mensaje) {
                // Si es un error de array (como 'lineas' o 'insumos'), el error es anidado.
                if (Array.isArray(error)) {
                    mensaje = `Hay errores en las prendas o insumos de la orden. Revisa las cantidades.`;
                } else {
                    mensaje = `El campo ${field} contiene un error.`;
                }
            }

            addToastOnly(
                "Error de Validación",
                mensaje,
                "warning"
            );
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
                className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: AppColors.border }}>
                    <h2 className="font-bold text-white text-lg">
                        {readOnly ? `Visualizar Orden ${orden?.numero || ""}` : (isEdit ? "Editar Orden de Trabajo" : "Nueva Orden de Producción")}
                    </h2>
                    <button type="button" onClick={onClose} style={{ color: AppColors.slate }}
                        className="hover:bg-red-500/10 hover:rotate-90 transition-transform duration-200 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <fieldset disabled={readOnly} className="contents">
                <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1 flex flex-col custom-scrollbar">
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

                    {/* SECCIÓN DE PRENDAS (Sin scroll anidado restrictivo) */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[11px] font-black uppercase tracking-widest text-orange-500">Prendas / Items</label>
                            {!readOnly && (
                                <button type="button" onClick={() => append({ descripcion: "", cantidad: 1, talla: "M", color: "", insumos: [] })}
                                    className="group flex items-center justify-center px-3 py-1.5 rounded-lg border border-orange-500/30 hover:bg-orange-500/10 cursor-pointer transition-all gap-1">
                                    <Plus className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-orange-500 uppercase">Añadir Prenda</span>
                                </button>
                            )}
                        </div>
                        {errors.lineas?.message && (
                            <p className="text-xs text-red-400 px-1 mt-0.5">{errors.lineas.message}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="h-full">
                                    <CardLineaOrden
                                        index={index}
                                        register={register}
                                        errors={errors}
                                        control={control}
                                        setValue={setValue}
                                        readOnly={readOnly}
                                        vLineas={vLineas}
                                        listaPrendas={listaPrendas}
                                        insumos={insumos}
                                        onRemove={() => remove(index)}
                                        showRemoveButton={fields.length > 1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECCIÓN DE LÍNEA DE PRODUCCIÓN (PIPELINE) */}
                    <div className="flex flex-col space-y-4 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[11px] font-black uppercase tracking-widest text-indigo-500">Línea de Producción (Pipeline)</label>
                            {!readOnly && (
                                <button type="button" onClick={() => appendAsig({ operario_id: "", tarea: "", piezas_requeridas: 1, notas: "" })}
                                    className="group flex items-center justify-center px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer transition-all gap-1">
                                    <Plus className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase">Añadir Tarea</span>
                                </button>
                            )}
                        </div>
                        {errors.asignaciones?.message && (
                            <p className="text-xs text-red-400 px-1">{errors.asignaciones.message}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-4">
                            {asigFields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-4 min-w-[260px] flex-1">
                                    <div className="w-full p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col gap-3 relative shadow-inner">
                                        <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-bold z-10 shadow-lg shadow-indigo-500/40 border-2 border-[#13161e]">
                                            {index + 1}
                                        </div>
                                        {!readOnly && (
                                            <button type="button" onClick={() => removeAsig(index)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-md transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-indigo-400/80 uppercase">Nombre de Tarea</label>
                                            <select {...register(`asignaciones.${index}.tarea`)} disabled={readOnly} className="w-full text-sm bg-black/20 rounded-md px-2 py-1.5 border border-white/5 text-white focus:outline-none focus:border-indigo-500 transition-colors capitalize">
                                                <option value="">Seleccionar tarea...</option>
                                                {MAQUINAS_LIST.map(maq => (
                                                    <option key={maq} value={maq}>{maq.replace("_", " ")}</option>
                                                ))}
                                            </select>
                                            {errors.asignaciones?.[index]?.tarea && <p className="text-[9px] text-red-400">{errors.asignaciones[index]?.tarea?.message}</p>}
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-indigo-400/80 uppercase">Operario Asignado</label>
                                            <select {...register(`asignaciones.${index}.operario_id`)} disabled={readOnly} className="w-full text-sm bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                                <option value="">Seleccionar operario...</option>
                                                {operarios.filter(op => {
                                                    if (op.estado !== 'activo') return false;
                                                    const selectedTarea = vAsignaciones?.[index]?.tarea;
                                                    if (!selectedTarea) return true;
                                                    return op.habilidades?.some(h => h.maquina === selectedTarea);
                                                }).map(op => (
                                                    <option key={op.id} value={op.id}>{op.nombre} {op.apellido}</option>
                                                ))}
                                            </select>
                                            {errors.asignaciones?.[index]?.operario_id && <p className="text-[9px] text-red-400">{errors.asignaciones[index]?.operario_id?.message}</p>}
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-indigo-400/80 uppercase">Piezas a Completar</label>
                                            <input type="number" min="1" {...register(`asignaciones.${index}.piezas_requeridas`, { valueAsNumber: true })} disabled={readOnly} className="w-full text-sm bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                            {errors.asignaciones?.[index]?.piezas_requeridas && <p className="text-[9px] text-red-400">{errors.asignaciones[index]?.piezas_requeridas?.message}</p>}
                                        </div>
                                    </div>
                                    {index < asigFields.length - 1 && (
                                        <div className="hidden md:flex text-indigo-500/50 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {asigFields.length === 0 && (
                                <div className="text-sm text-slate-500 italic p-4 bg-white/5 rounded-xl border border-white/5 w-full text-center">No has añadido ninguna tarea al pipeline. El sistema registrará un flujo continuo vacío.</div>
                            )}
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
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={sugerirFechaConIA}
                                        disabled={estimandoIA}
                                        className="text-[9px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                        style={{ color: AppColors.orange }}
                                    >
                                        {estimandoIA ? "Calculando..." : "✨ Sugerir con IA"}
                                    </button>
                                )}
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
                </fieldset>

                {/* Footer Principal */}
                <div className="flex gap-3 px-6 py-6 border-t shrink-0 bg-black/40" style={{ borderColor: AppColors.border }}>
                    {readOnly ? (
                        <button type="button" onClick={onClose}
                            className="w-full h-12 rounded-xl border border-white/5 text-sm font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
                            style={{ background: AppColors.orange }}>
                            CERRAR
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={onClose}
                                className="flex-1 h-12 rounded-xl border border-white/5 text-sm font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
                                CANCELAR
                            </button>
                            <button type="submit"
                                className="flex-[2] h-12 rounded-xl text-white text-xs font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                                style={{ background: AppColors.orange, boxShadow: `0 8px 24px -8px ${AppColors.orange}60` }}>
                                CONFIRMAR ORDEN
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}