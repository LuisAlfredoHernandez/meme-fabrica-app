import { useState } from "react";
import { X } from "lucide-react";


const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
};

export function ModalNuevoInsumo({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ nombre: "", tipo: "tela", subtipo: "", unidad: "metros", stock: "", minimo: "", proveedor: "" });
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <h2 className="font-bold text-white">Nuevo Insumo</h2>
                    <button onClick={onClose} style={{ color: C.slate }}><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    {/* Código autogenerado — guía al usuario */}
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                        style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                        <span className="text-xs font-semibold" style={{ color: C.slate }}>Código asignado:</span>
                        <span className="font-mono font-black text-sm" style={{ color: C.orange }}>
                            {form.tipo === "tela" ? "TEL-00X" : "ACC-00X"}
                        </span>
                        <span className="text-xs ml-auto" style={{ color: C.slate }}>Se genera al guardar</span>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Nombre del insumo</label>
                        <input value={form.nombre} onChange={e => set("nombre", e.target.value)}
                            placeholder="Ej: Tela micro azul rey"
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                            style={{ background: "#0d1018", border: `1.5px solid ${form.nombre ? C.orange : C.border}` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Tipo</label>
                            <select value={form.tipo} onChange={e => set("tipo", e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }}>
                                <option value="tela">Tela</option>
                                <option value="accesorio">Accesorio</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Unidad</label>
                            <select value={form.unidad} onChange={e => set("unidad", e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }}>
                                {["metros", "unidades", "rollos", "kg"].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Stock actual</label>
                            <input type="number" min={0} value={form.stock} onChange={e => set("stock", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.stock ? C.orange : C.border}` }} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Stock mínimo</label>
                            <input type="number" min={0} value={form.minimo} onChange={e => set("minimo", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                                style={{ background: "#0d1018", border: `1.5px solid ${form.minimo ? C.orange : C.border}` }} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Proveedor</label>
                        <input value={form.proveedor} onChange={e => set("proveedor", e.target.value)}
                            className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none"
                            style={{ background: "#0d1018", border: `1.5px solid ${form.proveedor ? C.orange : C.border}` }} />
                    </div>
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose}
                        className="flex-1 h-11 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: C.border, color: "#94a3b8" }}>Cancelar</button>
                    <button className="flex-1 h-11 rounded-xl text-white text-sm font-bold"
                        style={{ background: C.orange }}>Registrar insumo</button>
                </div>
            </div>
        </div>
    );
}