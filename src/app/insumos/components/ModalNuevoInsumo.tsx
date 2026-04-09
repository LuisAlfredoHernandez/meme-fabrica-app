import { useEffect, useRef, useState } from "react";
import { X, Search, PlusCircle, RefreshCcw } from "lucide-react";
import { useInsumosStore, useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import { cp } from "fs";
import { number } from "zod";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
    inputBg: "#0d1018"
};

export function ModalEntradaInsumo({ onClose }: { onClose: () => void }) {
    const { insumos } = useInsumosStore();
    const { createInsumo, updateInsumo } = useInsumosActions();

    // Estados del formulario
    const [form, setForm] = useState({
        id: "", nombre: "", tipo: "tela", unidad: "metros",
        cantidad: 0, minimo: 0, proveedor: "", codigo: ""
    });
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    // Filtrado
    const filteredInsumos = insumos.filter(insumo =>
        insumo.nombre.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    const generarCodigo = () => {
        let codigoAGenerar = null;
        if (form.tipo.includes("tela"))
            codigoAGenerar = "TEL";
        else if (form.tipo.includes("accesorio"))
            codigoAGenerar = "ACC"
        else codigoAGenerar = "UKN"

        const maxValue = Math.max(...insumos.map(x => Number(x.codigo?.substring(x.codigo.length - 3)) || 0)) + 1
        return `${codigoAGenerar} - 00${maxValue}`
    }

    // Lógica al enviar
    const handleSubmit = async () => {
        if (!form.nombre || !form.cantidad) return;

        if (isExisting) {
            // Buscamos el insumo original para sumar el stock
            const original = insumos.find(i => i.id === form.id);
            const nuevoStock = Number(original?.stock || 0) + Number(form.cantidad);
            await updateInsumo(form.id, { stock: nuevoStock });
        } else {
            await createInsumo({
                nombre: form.nombre,
                tipo: form.tipo as "tela" | "accesorio",
                unidad: form.unidad as "metros" | "unidades" | "rollos" | "kg",
                stock: form.cantidad,
                minimo: form.minimo,
                proveedor: form.proveedor,
                codigo: generarCodigo()
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
                style={{ background: C.surface, borderColor: C.border }}>

                {/* Header Dinámico */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <div>
                        <h2 className="font-bold text-white text-lg">Entrada de Inventario</h2>
                        <p className="text-[11px]" style={{ color: C.slate }}>
                            {isExisting ? "Reponiendo stock de insumo existente" : "Registrando nuevo material al sistema"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors" style={{ color: C.slate }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '80vh' }}>

                    {/* Buscador de Insumo (Nombre) - AHORA ES LO PRIMERO */}
                    <div className="space-y-1.5 relative" ref={containerRef}>
                        <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Nombre del Insumo</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Search className="w-4 h-4" style={{ color: isOpen ? C.orange : C.slate }} />
                            </div>
                            <input
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    set("nombre", e.target.value);
                                    setIsOpen(true);
                                    if (isExisting) setIsExisting(false); // Si escribe algo nuevo, resetear modo
                                }}
                                onFocus={() => setIsOpen(true)}
                                placeholder="Escribe o selecciona un insumo..."
                                className="w-full h-11 pl-11 pr-10 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                style={{ background: C.inputBg, borderColor: isOpen ? C.orange : C.border }}
                            />
                        </div>

                        {/* Dropdown flotante */}
                        {isOpen && filteredInsumos.length > 0 && (
                            <div className="absolute w-full mt-2 py-2 rounded-xl border z-50 shadow-2xl"
                                style={{ background: "#1a1f2e", borderColor: C.border }}>
                                {filteredInsumos.map((insumo) => (
                                    <button
                                        key={insumo.id}
                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-orange-500/10 flex items-center justify-between group"
                                        onClick={() => {
                                            setForm({
                                                id: insumo.id,
                                                nombre: insumo.nombre,
                                                tipo: insumo.tipo,
                                                unidad: insumo.unidad,
                                                cantidad: insumo.stock,
                                                minimo: insumo.minimo,
                                                proveedor: insumo.proveedor ?? "",
                                                codigo: insumo.codigo ?? ""
                                            });
                                            setQuery(insumo.nombre);
                                            setIsExisting(true);
                                            setIsOpen(false);
                                        }}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{insumo.nombre}</span>
                                            <span className="text-[10px]" style={{ color: C.slate }}>Stock actual: {insumo.stock} {insumo.unidad}</span>
                                        </div>
                                        <RefreshCcw className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Indicador de Modo */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                        style={{
                            background: isExisting ? "rgba(52,211,153,0.05)" : "rgba(249,115,22,0.05)",
                            borderColor: isExisting ? "rgba(52,211,153,0.2)" : "rgba(249,115,22,0.2)"
                        }}>
                        {isExisting ? <RefreshCcw className="w-4 h-4 text-emerald-400" /> : <PlusCircle className="w-4 h-4 text-orange-400" />}
                        <span className="text-xs font-bold" style={{ color: isExisting ? C.emerald : C.orange }}>
                            {isExisting ? "ACTUALIZANDO EXISTENCIA" : "NUEVO REGISTRO"}
                        </span>
                    </div>

                    {/* Grid: Tipo y Unidad (Deshabilitados si es existente) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Tipo</label>
                            <select
                                disabled={isExisting}
                                value={form.tipo}
                                onChange={e => set("tipo", e.target.value)}
                                className={`w-full h-11 px-3 rounded-xl text-sm text-white focus:outline-none border ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                onChange={e => set("unidad", e.target.value)}
                                className={`w-full h-11 px-3 rounded-xl text-sm text-white focus:outline-none border ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{ background: C.inputBg, borderColor: C.border }}>
                                {["metros", "unidades", "rollos", "kg"].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Cantidad a ingresar */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>
                                {isExisting ? "Cantidad a ingresar" : "Stock inicial"}
                            </label>
                            <input type="number" placeholder="0.00" value={form.cantidad} onChange={e => set("cantidad", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                style={{ background: C.inputBg, borderColor: form.cantidad ? C.orange : C.border }} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Mínimo sugerido</label>
                            <input type="number" placeholder="0.00" value={form.minimo} onChange={e => set("minimo", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                style={{ background: C.inputBg, borderColor: C.border }} />
                        </div>
                    </div>

                    {/* Proveedor */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Proveedor de esta entrada</label>
                        <input value={form.proveedor} onChange={e => set("proveedor", e.target.value)}
                            placeholder="Nombre del proveedor"
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                            style={{ background: C.inputBg, borderColor: C.border }} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-5 bg-black/20 border-t" style={{ borderColor: C.border }}>
                    <button onClick={onClose}
                        className="flex-1 h-12 rounded-xl border text-sm font-semibold hover:bg-white/5 transition-colors"
                        style={{ borderColor: C.border, color: "#94a3b8" }}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 h-12 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95"
                        style={{ background: C.orange }}>
                        {isExisting ? "Actualizar Stock" : "Registrar Insumo"}
                    </button>
                </div>
            </div>
        </div>
    );
}