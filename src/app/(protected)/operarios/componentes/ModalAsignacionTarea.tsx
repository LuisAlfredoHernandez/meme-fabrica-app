"use client";
import { useState, useEffect } from "react";
import { X, Hash, AlertCircle, Settings } from "lucide-react";
import { Operario, TAREAS_POR_MAQUINA } from "@/types";
import { AppColors } from "@/shared/constants";
import { useOrdenStore, useOrdenActions } from "@/features/ordenes/store/useOrdenesStore";
import { useMaquinasStore } from "@/features/maquinas/store/useMaquinasStore";
import { useOperarioStore } from "@/features/operarios/store/useOperarioStore";
import { useAsignacionStore } from "@/features/operarios/store/useAsignacionStore";

interface Props {
    operario: Operario;
    onClose: () => void;
    onConfirm: (asignacionId: string, ordenId: string, maquinaId: string) => void;
}

export function ModalAsignacionTarea({ operario, onClose, onConfirm }: Props) {
    const { ordenes } = useOrdenStore();
    const { fetchOrdenes } = useOrdenActions();

    const { maquinas, actions: maquinasActions } = useMaquinasStore();
    const { operarios } = useOperarioStore();
    const { asignaciones, actions: asignacionActions } = useAsignacionStore();

    const [selectedAsignacion, setSelectedAsignacion] = useState("");
    const [selectedMaquina, setSelectedMaquina] = useState("");

    // Cargar dependencias en el montaje
    useEffect(() => {
        fetchOrdenes();
        if (maquinas.length === 0) {
            maquinasActions.fetchMaquinas();
        }
        if (asignaciones.length === 0) {
            asignacionActions.fetchAsignaciones();
        }
    }, [fetchOrdenes, maquinasActions, maquinas.length, asignaciones.length, asignacionActions]);

    // Filtrar tareas (asignaciones) pendientes para ESTE operario
    const asignacionesPendientes = asignaciones.filter(a =>
        a.operario_id === operario.id &&
        (a.estado === "pendiente" || a.estado === "en_proceso")
    );

    // Auto-seleccionar si solo hay una tarea pendiente
    useEffect(() => {
        if (asignacionesPendientes.length === 1 && !selectedAsignacion) {
            setSelectedAsignacion(asignacionesPendientes[0].id);
        }
    }, [asignacionesPendientes, selectedAsignacion]);

    // Auto-seleccionar la máquina que el operario ya está usando (si aplica)
    useEffect(() => {
        if (!selectedMaquina && operario.maquina_actual_id) {
            setSelectedMaquina(operario.maquina_actual_id);
        }
    }, [operario.maquina_actual_id, selectedMaquina]);

    const handleConfirmar = () => {
        if (!selectedAsignacion || !selectedMaquina) return;
        const asig = asignacionesPendientes.find(a => a.id === selectedAsignacion);
        if (!asig) return;

        onConfirm(selectedAsignacion, asig.orden_id, selectedMaquina);
        onClose();
    };

    // Lógica dinámica del botón de confirmación
    const asigSeleccionada = asignacionesPendientes.find(a => a.id === selectedAsignacion);
    const isMismaTarea = asigSeleccionada?.estado === 'en_proceso';
    const isMismaMaquina = operario.maquina_actual_id === selectedMaquina;

    let btnText = "Iniciar Trabajo";
    let isRedundante = false;

    if (isMismaTarea && isMismaMaquina) {
        btnText = "Ya está trabajando en esto";
        isRedundante = true;
    } else if (isMismaTarea && !isMismaMaquina) {
        btnText = "Mover de Máquina";
    } else if (!isMismaTarea && isMismaMaquina && operario.estado === 'activo') {
        btnText = "Cambiar de Tarea";
    }

    const isBtnDisabled = !selectedAsignacion || !selectedMaquina || isRedundante;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md flex flex-col rounded-3xl shadow-2xl overflow-hidden border"
                style={{ background: AppColors.surface, borderColor: AppColors.border }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: AppColors.border }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 font-black">
                            {operario?.nombre?.[0] || ""}{operario?.apellido?.[0] || ""}
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base">Despachar a Máquina</h2>
                            <p className="text-[11px] text-slate-500">{operario.nombre} {operario.apellido}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">

                    {/* Selección de Asignación (Tarea) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-orange-500" /> Tarea Planeada a Iniciar
                        </label>
                        {asignacionesPendientes.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-center">
                                <AlertCircle className="w-6 h-6 text-orange-400 mx-auto mb-2 opacity-50" />
                                <p className="text-xs text-orange-300/70 font-medium">Este operario no tiene tareas pendientes planeadas para despachar.</p>
                                <p className="text-[10px] text-slate-500 mt-1">Asigna una tarea a este operario desde la vista de Gestión de Órdenes.</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    value={selectedAsignacion}
                                    onChange={(e) => setSelectedAsignacion(e.target.value)}
                                    className="w-full h-12 pl-4 pr-10 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 appearance-none font-medium"
                                >
                                    <option value="">Seleccionar tarea a iniciar...</option>
                                    {asignacionesPendientes.map(asig => {
                                        const ord = ordenes.find(o => o.id === asig.orden_id);
                                        const ordText = ord ? `${ord.numero}` : "Orden Desconocida";
                                        const statusFlag = asig.estado === 'en_proceso' ? ' [EN PROCESO]' : '';
                                        const label = `${ordText} - ${asig.tarea} (${asig.piezas_requeridas} uds)${statusFlag}`;
                                        return (
                                            <option key={asig.id} value={asig.id}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Selección de Máquina Física */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Settings className="w-3.5 h-3.5 text-orange-500" /> Máquina Física a Utilizar
                        </label>
                        <div className="relative">
                            <select
                                value={selectedMaquina}
                                onChange={(e) => setSelectedMaquina(e.target.value)}
                                className="w-full h-12 pl-4 pr-10 rounded-2xl bg-[#0d1018] border border-[#1e2130] text-sm text-white focus:outline-none focus:border-orange-500/50 appearance-none font-medium"
                                disabled={asignacionesPendientes.length === 0}
                            >
                                <option value="">Seleccionar máquina física...</option>
                                {maquinas.filter(m => {
                                    const asig = asignacionesPendientes.find(a => a.id === selectedAsignacion);
                                    let maquinaValidaParaTarea = true;

                                    if (asig && asig.tarea) {
                                        const tiposPermitidos = Object.entries(TAREAS_POR_MAQUINA)
                                            .filter(([_, tareas]) => tareas.includes(asig.tarea))
                                            .map(([tipo]) => tipo);

                                        if (tiposPermitidos.length > 0) {
                                            maquinaValidaParaTarea = tiposPermitidos.includes(m.tipo);
                                        }
                                    }

                                    return maquinaValidaParaTarea &&
                                        m.estado === 'operativa' &&
                                        (operario?.habilidades || []).some(h => h.maquina === m.tipo);
                                }).map(maq => {
                                    // Comprobar si la máquina está en uso por OTRO operario
                                    const operarioEnUso = operarios.find(op => op.maquina_actual_id === maq.id && op.id !== operario.id && op.estado === 'activo');
                                    // Comprobar si es la máquina que ESTE operario ya está usando
                                    const esSuMaquina = operario.maquina_actual_id === maq.id;

                                    let inUseText = '';
                                    if (operarioEnUso) inUseText = ` (En uso por ${operarioEnUso.nombre})`;
                                    else if (esSuMaquina) inUseText = ` (Máquina actual)`;

                                    return (
                                        <option key={maq.id} value={maq.id} disabled={!!operarioEnUso}>
                                            {maq.nombre} ({maq.codigo}){inUseText}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-black/20 border-t border-[#1e2130]">
                    <button
                        onClick={handleConfirmar}
                        disabled={isBtnDisabled}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                        style={{ background: isRedundante ? AppColors.surface : AppColors.orange }}
                    >
                        {btnText}
                    </button>
                </div>
            </div>
        </div>
    );
}