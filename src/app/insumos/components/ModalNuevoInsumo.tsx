import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, Search, Package, Tag } from "lucide-react";
import { useInsumosStore } from "@/features/insumos/store/useInsumosStore";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
    inputBg: "#0d1018"
};

export function ModalNuevoInsumo({ onClose }: { onClose: () => void }) {
    const { insumos } = useInsumosStore();
    const [form, setForm] = useState({
        nombre: "", tipo: "tela", unidad: "metros",
        stock: "", minimo: "", proveedor: ""
    });

    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));


    const normalizeText = (text: string) =>
        text
            .normalize("NFD")                 // separa letra y acento
            .replace(/[\u0300-\u036f]/g, "")  // elimina acentos
            .toLowerCase();                   // opcional: ignora mayúsculas

    // Filtrar por TIPO y por BÚSQUEDA
    const filteredInsumos = insumos.filter(insumo =>
        normalizeText(insumo.tipo) === normalizeText(form.tipo) &&
        normalizeText(insumo.nombre).includes(normalizeText(query))
    ).slice(0, 10);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
                style={{ background: C.surface, borderColor: C.border, maxHeight: '90vh' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <div>
                        <h2 className="font-bold text-white text-lg">Nuevo Insumo</h2>
                        <p className="text-[11px]" style={{ color: C.slate }}>Registra un nuevo material al inventario</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors" style={{ color: C.slate }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Con Scroll si es necesario) */}
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

                    {/* Badge de Código */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                        style={{ background: "rgba(249,115,22,0.05)", borderColor: "rgba(249,115,22,0.2)" }}>
                        <Tag className="w-4 h-4" style={{ color: C.orange }} />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold" style={{ color: C.slate }}>Código Sugerido</span>
                            <span className="font-mono font-black text-sm" style={{ color: C.orange }}>
                                {form.tipo === "tela" ? "TEL-XXXX" : "ACC-XXXX"}
                            </span>
                        </div>
                        <span className="text-[10px] ml-auto italic" style={{ color: C.slate }}>Auto-generado</span>
                    </div>

                    {/* Fila: Tipo y Unidad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Tipo</label>
                            <select
                                value={form.tipo}
                                onChange={e => { set("tipo", e.target.value); setQuery(""); }}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white focus:outline-none border transition-all cursor-pointer"
                                style={{ background: C.inputBg, borderColor: C.border }}>
                                <option value="tela">Tela</option>
                                <option value="accesorio">Accesorio</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Unidad</label>
                            <select
                                value={form.unidad}
                                onChange={e => set("unidad", e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white focus:outline-none border transition-all cursor-pointer"
                                style={{ background: C.inputBg, borderColor: C.border }}>
                                {["metros", "unidades", "rollos", "kg"].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Combobox: Nombre del insumo */}
                    <div className="space-y-1.5 relative" ref={containerRef}>
                        <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Nombre del insumo</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Search className="w-4 h-4 transition-colors" style={{ color: isOpen ? C.orange : C.slate }} />
                            </div>
                            <input
                                value={query}
                                onChange={e => { setQuery(e.target.value); set("nombre", e.target.value); setIsOpen(true); }}
                                onFocus={() => setIsOpen(true)}
                                placeholder={`Buscar o escribir ${form.tipo}...`}
                                className="w-full h-11 pl-11 pr-10 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                style={{
                                    background: C.inputBg,
                                    borderColor: isOpen ? C.orange : C.border,
                                    boxShadow: isOpen ? `0 0 0 1px ${C.orange}20` : 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: C.slate }} />
                            </button>
                        </div>

                        {/* Dropdown flotante */}
                        {isOpen && filteredInsumos.length > 0 && (
                            <div className="absolute w-full mt-2 py-2 rounded-xl border z-[60] shadow-2xl animate-in fade-in slide-in-from-top-2"
                                style={{ background: "#1a1f2e", borderColor: C.border }}>
                                {filteredInsumos.map((insumo) => (
                                    <button
                                        key={insumo.id}
                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-orange-500/10 flex items-center justify-between group transition-colors"
                                        onClick={() => {
                                            set("nombre", insumo.nombre);
                                            setQuery(insumo.nombre);
                                            setIsOpen(false);
                                        }}>
                                        <div className="flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{insumo.nombre}</span>
                                        </div>
                                        <span className="text-[10px] text-orange-500 font-bold opacity-0 group-hover:opacity-100 uppercase">Usar</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fila: Stocks */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Stock actual</label>
                            <input type="number" placeholder="0.00" value={form.stock} onChange={e => set("stock", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                style={{ background: C.inputBg, borderColor: form.stock ? C.orange : C.border }} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Stock mínimo</label>
                            <input type="number" placeholder="0.00" value={form.minimo} onChange={e => set("minimo", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                                style={{ background: C.inputBg, borderColor: form.minimo ? C.orange : C.border }} />
                        </div>
                    </div>

                    {/* Proveedor */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>Proveedor</label>
                        <input value={form.proveedor} onChange={e => set("proveedor", e.target.value)}
                            placeholder="Nombre de la empresa o contacto"
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none border transition-all"
                            style={{ background: C.inputBg, borderColor: form.proveedor ? C.orange : C.border }} />
                    </div>
                </div>

                {/* Footer de Botones */}
                <div className="flex gap-3 px-6 py-5 bg-black/20 border-t" style={{ borderColor: C.border }}>
                    <button onClick={onClose}
                        className="flex-1 h-12 rounded-xl border text-sm font-semibold hover:bg-white/5 transition-colors"
                        style={{ borderColor: C.border, color: "#94a3b8" }}>
                        Cancelar
                    </button>
                    <button
                        className="flex-1 h-12 rounded-xl text-white text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                        style={{ background: C.orange }}>
                        Registrar insumo
                    </button>
                </div>
            </div>
        </div>
    );
}