"use client";
import { useState, useEffect, useRef } from "react";
import { X, Search, Zap, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCcw, User } from "lucide-react";
import { useOperarioActions } from "@/features/operarios/store/useOperarioStore";
import { Operario, RolUsuario, Status, HabilidadMaquinaria, TipoMaquina } from "@/types";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", slate: "#475569", inputBg: "#0d1018"
};

const MAQUINAS_OPTIONS: TipoMaquina = [
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

    // Estado inicial: Inactivo y sin máquinas por defecto
    const [form, setForm] = useState({
        id: "",
        nombre: "",
        apellido: "",
        estado: "inactivo" as Status,
        rol: "operario" as RolUsuario,
        habilidades: [] as HabilidadMaquinaria[]
    });

    const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredOperarios = operarios.filter(op =>
        normalizeText(`${op.nombre} ${op.apellido}`).includes(normalizeText(query))
    ).slice(0, 5);

    const toggleMaquina = (maquinaId: TipoMaquina) => {
        const existe = form.habilidades.some(h => h.maquina === maquinaId);
        if (existe) {
            setForm(p => ({ ...p, habilidades: p.habilidades.filter(h => h.maquina !== maquinaId) }));
        } else {
            setForm(p => ({ ...p, habilidades: [...p.habilidades, { maquina: maquinaId, nivelEficiencia: 0 }] }));
        }
    };

    const { createOperario, updateOperario, deleteOperario } = useOperarioActions();

    const handleCreate = async () => {
        try {
            const { id, ...dataToCreate } = form;
            await createOperario(dataToCreate);
            onClose();
        } catch (error) {
            console.error("Error al crear operario:", error);
        }
    };

    const handleUpdate = async () => {
        try {
            await updateOperario(form.id, form);
            onClose();
        } catch (error) {
            console.error("Error al actualizar operario:", error);
        }
    };

    const onSubmitModal = () => {
        if (isExisting) {
            handleUpdate();
        } else {
            handleCreate();
        }
    }

    const handleDelete = async () => {
        try {
            await deleteOperario(form.id);
            onClose();
        } catch (error) {
            console.error("Error al eliminar operario:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">

            {/* PopUp de Confirmación de Eliminación */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-[#1a1f2e] border border-red-500/30 p-6 rounded-2xl max-w-xs text-center shadow-2xl">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-400 w-6 h-6" />
                        </div>
                        <h4 className="text-white font-bold">¿Eliminar Operario?</h4>
                        <p className="text-xs text-slate-400 mt-2">Esta acción borrará todo el historial de {form.nombre} de forma permanente.</p>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 text-xs text-slate-500 font-bold hover:bg-white/5 rounded-lg">Cancelar</button>
                            <button onClick={handleDelete} className="flex-1 py-2 text-xs bg-red-500 text-white font-bold rounded-lg shadow-lg">Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
                style={{ background: C.surface, borderColor: C.border }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <User className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Gestión de Operarios</h2>
                            <p className="text-[11px]" style={{ color: C.slate }}>Panel de RRHH · Meme Fábricas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Botón Eliminar: Solo aparece si existe el operario */}
                        {isExisting && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2.5 rounded-full hover:bg-red-500/10 transition-colors group"
                                title="Eliminar Operario"
                            >
                                <Trash2 className="w-4.5 h-4.5 text-slate-500 group-hover:text-red-400" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors" style={{ color: C.slate }}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '70vh' }}>

                    {/* Buscador Superior */}
                    <div className="space-y-1.5 relative">
                        <label className="text-xs font-semibold px-1 text-slate-400">Buscar o Registrar</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setIsOpen(true);
                                    // Auto-poblamiento para nuevos usuarios al escribir
                                    if (!isExisting) {
                                        const partes = e.target.value.trim().split(" ");
                                        setForm(prev => ({
                                            ...prev,
                                            nombre: partes[0] || "",
                                            apellido: partes.slice(1).join(" ") || "",
                                            habilidades: []
                                        }));
                                    }
                                    if (isExisting) setIsExisting(false);
                                }}
                                onFocus={() => setIsOpen(true)}
                                placeholder="Escribe el nombre completo..."
                                className="w-full h-11 pl-11 pr-10 rounded-xl text-white text-sm focus:outline-none border border-[#1e2130] bg-[#0d1018] focus:border-orange-500/50 transition-all"
                            />
                        </div>

                        {isOpen && query.length > 0 && filteredOperarios.length > 0 && (
                            <div className="absolute w-full mt-2 py-2 rounded-xl border z-50 shadow-2xl bg-[#1a1f2e] border-[#1e2130]">
                                {filteredOperarios.map((op) => (
                                    <button
                                        key={op.id}
                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-orange-500/10 flex items-center justify-between group"
                                        onClick={() => {
                                            setForm(op);
                                            setQuery(`${op.nombre} ${op.apellido}`);
                                            setIsExisting(true);
                                            setIsOpen(false);
                                        }}>
                                        <span className="font-medium">{op.nombre} {op.apellido}</span>
                                        <RefreshCcw className="w-4 h-4 text-orange-500" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ficha de Edición de Nombre (Aquí se modifica el nombre) */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre</label>
                            <input
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500/30 pb-1"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Apellido</label>
                            <input
                                value={form.apellido}
                                onChange={e => setForm({ ...form, apellido: e.target.value })}
                                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500/30 pb-1"
                            />
                        </div>
                    </div>

                    {/* Selector de Estado */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold px-1 text-slate-400">Estado en Planta</label>
                        <div className="flex p-1 rounded-xl bg-[#0d1018] border border-white/5">
                            <button onClick={() => setForm({ ...form, estado: "activo" })}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${form.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-600'}`}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVO
                            </button>
                            <button onClick={() => setForm({ ...form, estado: "inactivo" })}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${form.estado === 'inactivo' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-600'}`}>
                                <AlertCircle className="w-3.5 h-3.5" /> INACTIVO
                            </button>
                        </div>
                    </div>

                    {/* Certificaciones */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-400" /> Estaciones Certificadas
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {MAQUINAS_OPTIONS.map(m => {
                                const activo = form.habilidades.some(h => h.maquina === m.id);
                                return (
                                    <button key={m.id} onClick={() => toggleMaquina(m.id)}
                                        className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                                        style={{
                                            borderColor: activo ? m.color : C.border,
                                            background: activo ? `${m.color}10` : "#0d1018",
                                        }}>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: activo ? m.color : C.slate }} />
                                        <span className={`text-[11px] font-bold ${activo ? 'text-white' : 'text-slate-500'}`}>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer con Botón de Eliminar */}
                <div className="flex items-center gap-3 px-6 py-5 bg-black/20 border-t border-[#1e2130]">
                    <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-[#1e2130] text-sm font-semibold text-slate-400 hover:bg-white/5">
                        Cancelar
                    </button>
                    <button onClick={onSubmitModal} className="flex-[2] h-12 rounded-xl text-white text-sm font-bold shadow-lg" style={{ background: C.orange }}>
                        {isExisting ? "Guardar Cambios" : "Crear Operario"}
                    </button>
                </div>
            </div>
        </div>
    );
}