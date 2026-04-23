"use client";
import { useRef, useState } from "react";
import { X, Search, PlusCircle, MinusCircle, Trash2, RefreshCcw, AlertCircle } from "lucide-react";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { normalizeText } from "@/utils/formatters";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
    inputBg: "#0d1018"
};

type OperationMode = "entrada" | "salida" | "eliminar";

export function ModalGestionInsumo({ onClose }: { onClose: () => void }) {
    const { insumos } = useInsumosStore();
    const { createInsumo, updateInsumo, deleteInsumo } = useInsumosActions();

    // Estado de la operación
    const [mode, setMode] = useState<OperationMode>("entrada");
    const [showConfirm, setShowConfirm] = useState(false);

    // Estados del formulario
    const [form, setForm] = useState({
        id: "", nombre: "", tipo: "", unidad: "",
        cantidad: 0, minimo: 0, proveedor: "", codigo: ""
    });

    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const setField = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));


    // Filtrar por TIPO y por BÚSQUEDA
    const filteredInsumos = insumos.filter(insumo =>
        normalizeText(insumo.nombre).includes(normalizeText(query))
    ).slice(0, 10);


    const generarCodigo = () => {
        const prefix = form.tipo === "tela" ? "TEL" : form.tipo === "accesorio" ? "ACC" : "UKN";
        const maxValue = Math.max(...insumos.map(x => Number(x.codigo?.split("-")[1]) || 0)) + 1;
        return `${prefix}-${String(maxValue).padStart(3, '0')}`;
    };

    const handleAction = async () => {
        if (mode === "eliminar") {
            await deleteInsumo(form.id);
            onClose();
            return;
        }

        if (!form.nombre || form.cantidad <= 0) return;

        if (isExisting) {
            const original = insumos.find(i => i.id === form.id);
            const stockActual = Number(original?.stock || 0);

            // Lógica de suma o resta
            const nuevoStock = mode === "entrada"
                ? stockActual + Number(form.cantidad)
                : Math.max(0, stockActual - Number(form.cantidad));

            await updateInsumo(form.id, { stock: nuevoStock });
        } else {
            // Solo se crean nuevos en modo "entrada"
            await createInsumo({
                ...form,
                stock: form.cantidad,
                codigo: generarCodigo()
            } as any);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* POPUP DE CONFIRMACIÓN INTERNO */}
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
                                : `Se retirarán ${form.cantidad} ${form.unidad} del inventario.`}
                        </p>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 text-xs text-slate-400 font-bold hover:bg-white/5 rounded-lg">Atrás</button>
                            <button onClick={handleAction} className="flex-1 py-2 text-xs bg-red-500 text-white font-bold rounded-lg shadow-lg">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
                style={{ background: C.surface, borderColor: C.border }}>

                {/* Header Dinámico */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <div>
                        <h2 className="font-bold text-white text-lg">Movimiento de Stock</h2>
                        <p className="text-[11px]" style={{ color: C.slate }}>Gestión de inventario Meme Fábricas</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors" style={{ color: C.slate }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '80vh' }}>

                    {/* SELECTOR DE OPERACIÓN (MODO) */}
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: C.inputBg }}>
                        <button
                            onClick={() => setMode("entrada")}
                            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === "entrada" ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500'}`}>
                            <PlusCircle className="w-4 h-4" /> Entrada
                        </button>
                        <button
                            onClick={() => { if (isExisting) setMode("salida") }}
                            disabled={!isExisting}
                            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!isExisting ? 'opacity-20 cursor-not-allowed' : ''} ${mode === "salida" ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-500'}`}>
                            <MinusCircle className="w-4 h-4" /> Salida
                        </button>
                        <button
                            onClick={() => { if (isExisting) setMode("eliminar") }}
                            disabled={!isExisting}
                            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!isExisting ? 'opacity-20 cursor-not-allowed' : ''} ${mode === "eliminar" ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-500'}`}>
                            <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                    </div>

                    {/* Buscador de Insumo */}
                    <div className="space-y-1.5 relative" ref={containerRef}>
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Nombre del Insumo</label>

                            {/* INDICADOR DE NUEVO ELEMENTO */}
                            {!isExisting && query.length > 2 && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in zoom-in duration-300">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Nuevo Insumo</span>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Search className="w-4 h-4" style={{ color: isOpen ? C.orange : C.slate }} />
                            </div>
                            <input
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setField("nombre", e.target.value);
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
                                    background: C.inputBg,
                                    borderColor: !isExisting && query.length > 2 ? `${C.emerald}40` : (isOpen ? C.orange : C.border)
                                }}
                            />

                            {/* ICONO DE STATUS DENTRO DEL INPUT */}
                            {!isExisting && query.length > 2 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <PlusCircle className="w-4 h-4 text-emerald-500/50" />
                                </div>
                            )}
                        </div>

                        {/* Dropdown flotante (Sin cambios) */}
                        {isOpen && filteredInsumos.length > 0 && (
                            <div className="absolute w-full mt-2 py-2 rounded-xl border z-50 shadow-2xl"
                                style={{ background: "#1a1f2e", borderColor: C.border }}>
                                {filteredInsumos.map((ins) => (
                                    <button
                                        key={ins.id}
                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-orange-500/10 flex items-center justify-between group"
                                        onClick={() => {
                                            setForm({
                                                id: ins.id,
                                                nombre: ins.nombre,
                                                tipo: ins.tipo,
                                                unidad: ins.unidad,
                                                cantidad: 0,
                                                minimo: ins.minimo,
                                                proveedor: ins.proveedor ?? "",
                                                codigo: ins.codigo ?? ""
                                            });
                                            setQuery(ins.nombre);
                                            setIsExisting(true);
                                            setIsOpen(false);
                                        }}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{ins.nombre}</span>
                                            <span className="text-[10px]" style={{ color: C.slate }}>Stock: {ins.stock} {ins.unidad}</span>
                                        </div>
                                        <RefreshCcw className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Seccion Dinámica según Modo */}
                    {mode !== "eliminar" ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Tipo</label>
                                    <select
                                        disabled={isExisting}
                                        value={form.tipo}
                                        onChange={e => setField("tipo", e.target.value)}
                                        className={`w-full h-11 px-3 rounded-xl text-sm text-white border ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ background: C.inputBg, borderColor: C.border }}>
                                        <option value="tela">Tela</option>
                                        <option value="accesorio">Accesorio</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Unidad</label>
                                    <select
                                        disabled={isExisting}
                                        value={form.unidad}
                                        onChange={e => setField("unidad", e.target.value)}
                                        className={`w-full h-11 px-3 rounded-xl text-sm text-white border ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ background: C.inputBg, borderColor: C.border }}>
                                        {["metros", "unidades", "rollos", "kg"].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: mode === "entrada" ? C.emerald : C.orange }}>
                                        Cantidad a {mode === "entrada" ? "sumar" : "retirar"}
                                    </label>
                                    <input type="number" value={form.cantidad} onChange={e => setField("cantidad", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                        style={{ background: C.inputBg, borderColor: form.cantidad > 0 ? (mode === "entrada" ? C.emerald : C.orange) : C.border }} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Mínimo Crítico</label>
                                    <input type="number" value={form.minimo} onChange={e => setField("minimo", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl text-white text-sm border"
                                        style={{ background: C.inputBg, borderColor: C.border }} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center gap-3">
                            <Trash2 className="text-red-400 w-5 h-5" />
                            <p className="text-xs text-red-200">Se eliminará el insumo <b>{form.nombre}</b>. Esta acción es irreversible.</p>
                        </div>
                    )}

                    {mode === "entrada" && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Proveedor</label>
                            <input value={form.proveedor} onChange={e => setField("proveedor", e.target.value)}
                                placeholder="Nombre del proveedor"
                                className="w-full h-11 px-4 rounded-xl text-white text-sm border"
                                style={{ background: C.inputBg, borderColor: C.border }} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-5 bg-black/20 border-t" style={{ borderColor: C.border }}>
                    <button onClick={onClose} className="flex-1 h-12 rounded-xl border text-sm font-semibold text-slate-400 hover:bg-white/5 transition-colors" style={{ borderColor: C.border }}>
                        Cancelar
                    </button>
                    <button
                        onClick={() => (mode !== "entrada" ? setShowConfirm(true) : handleAction())}
                        className="flex-1 h-12 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95"
                        style={{ background: mode === "entrada" ? C.emerald : mode === "salida" ? C.orange : C.red }}>
                        {mode === "entrada" ? "Registrar Entrada" : mode === "salida" ? "Retirar Stock" : "Eliminar Todo"}
                    </button>
                </div>
            </div>
        </div>
    );
}