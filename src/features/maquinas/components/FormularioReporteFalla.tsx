"use client";

import { useState } from "react";
import { Maquina } from "@/types";
import { CheckCircle2, AlertTriangle, Wrench } from "lucide-react";

interface FormularioReporteFallaProps {
    miMaquina: Maquina | null;
    miOperarioId?: string;
    reportarAveria: (data: {
        maquina_id: string;
        operario_id: string;
        descripcion: string;
        tipo_falla: string;
        gravedad: string;
        detiene_produccion: boolean;
    }) => Promise<boolean>;
}

export function FormularioReporteFalla({
    miMaquina,
    miOperarioId,
    reportarAveria,
}: FormularioReporteFallaProps) {
    const [motivoFalla, setMotivoFalla] = useState("");
    const [tipoFalla, setTipoFalla] = useState("mecanica");
    const [gravedad, setGravedad] = useState("moderada");
    const [detieneProduccion, setDetieneProduccion] = useState(false);
    const [showFallaForm, setShowFallaForm] = useState(false);

    const handleReportarFalla = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!miMaquina || !miOperarioId || motivoFalla.trim() === "") return;

        const success = await reportarAveria({
            maquina_id: miMaquina.id,
            operario_id: miOperarioId,
            descripcion: motivoFalla,
            tipo_falla: tipoFalla,
            gravedad: gravedad,
            detiene_produccion: detieneProduccion
        });

        if (success) {
            alert(`Avería reportada exitosamente en ${miMaquina.nombre}. La máquina está ahora en mantenimiento.`);
            setMotivoFalla("");
            setTipoFalla("mecanica");
            setGravedad("moderada");
            setDetieneProduccion(false);
            setShowFallaForm(false);
        } else {
            alert("Error al enviar el reporte de avería.");
        }
    };

    if (!miMaquina) {
        return (
            <div className="bg-[#13161e] border border-[#1e2130] p-5 rounded-3xl text-slate-500 font-semibold italic text-sm text-center">
                Cargando información de máquina...
            </div>
        );
    }

    return (
        <div className="bg-[#13161e] border border-[#1e2130] p-5 rounded-3xl hover:border-slate-800 transition-colors shadow-lg shadow-black/50 flex flex-col">
            <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-colors ${miMaquina.estado === "operativa" ? "bg-[#34d399]/10 text-[#34d399]" : "bg-red-500/10 text-red-500"}`}>
                    {miMaquina.estado === "operativa" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <h2 className="text-xl font-bold text-white">Estado de la Máquina</h2>
            </div>

            <div className="flex-1">
                {miMaquina.estado === "operativa" ? (
                    <div className="flex flex-col h-full justify-center">
                        {!showFallaForm ? (
                            <div className="text-center py-2 animate-in fade-in duration-500">
                                <div className="w-16 h-16 rounded-full bg-[#34d399]/10 flex items-center justify-center mx-auto mb-4 border border-[#34d399]/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-transform hover:scale-110 duration-500">
                                    <CheckCircle2 className="w-8 h-8 text-[#34d399]" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1.5">Máquina Operativa</h3>
                                <p className="text-slate-400 mb-6 font-medium px-4 text-xs">Si experimentas problemas técnicos, cambia el estado de tu máquina a inactiva.</p>
                                <button
                                    onClick={() => setShowFallaForm(true)}
                                    className="group flex items-center justify-center gap-2.5 w-full px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#1e2130] to-[#13161e] border border-[#1e2130] hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300 active:scale-95 cursor-pointer text-sm"
                                >
                                    <Wrench className="w-4.5 h-4.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                                    <span className="group-hover:text-red-400 transition-colors">Reportar Avería</span>
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleReportarFalla} className="space-y-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-1">
                                    <p className="text-xs font-medium text-red-400">Registrando reporte de avería. Por favor ingresa los detalles.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Fallo</label>
                                        <select
                                            value={tipoFalla}
                                            onChange={(e) => setTipoFalla(e.target.value)}
                                            className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500 transition-all hover:border-slate-700 text-sm"
                                        >
                                            <option value="mecanica">Mecánico</option>
                                            <option value="electrica">Eléctrico</option>
                                            <option value="software">Software / Panel</option>
                                            <option value="otra">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gravedad</label>
                                        <select
                                            value={gravedad}
                                            onChange={(e) => setGravedad(e.target.value)}
                                            className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500 transition-all hover:border-slate-700 text-sm"
                                        >
                                            <option value="leve">Leve (Operativa)</option>
                                            <option value="moderada">Moderada (Rendimiento bajo)</option>
                                            <option value="critica">Crítica (Peligro/Parada)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                                    <input
                                        type="checkbox"
                                        id="detiene_produccion"
                                        checked={detieneProduccion}
                                        onChange={(e) => setDetieneProduccion(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-700 text-red-500 focus:ring-red-500 focus:ring-opacity-25 cursor-pointer"
                                    />
                                    <label htmlFor="detiene_produccion" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                                        ¿Detiene completamente la producción?
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descripción del Problema</label>
                                    <textarea
                                        required
                                        value={motivoFalla}
                                        onChange={(e) => setMotivoFalla(e.target.value)}
                                        rows={2}
                                        className="w-full bg-[#080b10] border border-[#1e2130] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all hover:border-slate-700 resize-none shadow-inner text-sm"
                                        placeholder="Describe el problema técnico (ej. aguja rota)..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowFallaForm(false);
                                            setMotivoFalla("");
                                            setTipoFalla("mecanica");
                                            setGravedad("moderada");
                                            setDetieneProduccion(false);
                                        }}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-slate-400 border border-[#1e2130] hover:bg-[#1e2130] hover:text-white transition-colors cursor-pointer text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/25 active:scale-95 cursor-pointer text-sm"
                                    >
                                        Confirmar Falla
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-full justify-center text-center py-4 animate-in fade-in duration-500">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] relative animate-pulse">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping"></span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1.5">Máquina Fuera de Servicio</h3>
                        <p className="text-slate-400 font-medium px-4 text-xs">El reporte ha sido enviado. Un técnico o supervisor revisará la máquina pronto.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
