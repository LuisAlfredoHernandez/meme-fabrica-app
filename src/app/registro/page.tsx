"use client";
// ─────────────────────────────────────────────────────────────
// app/registro/page.tsx — RF4 · RNF-04 (≤3 taps para registrar)
// Captura táctil optimizada para planta
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
    CheckCircle2, AlertTriangle, Wrench, Package,
    Scissors, Zap, ChevronRight, RotateCcw, Clock,
} from "lucide-react";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
};

type Incidencia = "falla_mecanica" | "falta_insumo" | "error_corte" | "ninguna";

const INCIDENCIAS: { id: Incidencia; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "falla_mecanica", label: "Falla mecánica", icon: <Wrench className="w-6 h-6" />, color: C.red },
    { id: "falta_insumo", label: "Falta de insumo", icon: <Package className="w-6 h-6" />, color: C.amber },
    { id: "error_corte", label: "Error de corte", icon: <Scissors className="w-6 h-6" />, color: C.violet },
    { id: "ninguna", label: "Sin incidencias", icon: <CheckCircle2 className="w-6 h-6" />, color: C.emerald },
];

// Contadores de piezas con botones grandes (táctil)
function ContadorTactil({
    label, value, onChange, color = C.orange,
}: { label: string; value: number; onChange: (v: number) => void; color?: string }) {
    const presets = [1, 5, 10, 25];
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-5 pt-4 pb-2">
                <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>{label}</p>
                <p className="text-5xl font-black font-mono mt-1" style={{ color }}>{value}</p>
            </div>
            {/* Presets + / - */}
            <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-4 gap-2">
                    {presets.map(n => (
                        <button key={n} onClick={() => onChange(Math.max(0, value + n))}
                            className="h-12 rounded-xl font-bold text-sm transition-all active:scale-95"
                            style={{ background: `${color}20`, color }}>+{n}</button>
                    ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {presets.map(n => (
                        <button key={n} onClick={() => onChange(Math.max(0, value - n))}
                            className="h-12 rounded-xl font-bold text-sm transition-all active:scale-95"
                            style={{ background: "#1e293b", color: "#94a3b8" }}>−{n}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function RegistroPage() {
    // Simulamos operario autenticado
    const operario = { nombre: "Carmen Méndez", maquina: "MERROW-01", orden: "ORD-2026-0042" };

    // El flujo es: paso 1 (confirmar tarea) → paso 2 (contar piezas) → paso 3 (incidencia) → guardado
    // Solo 3 interacciones principales = cumple RNF-04
    const [paso, setPaso] = useState<1 | 2 | 3>(1);
    const [piezas, setPiezas] = useState(0);
    const [defectuosas, setDefect] = useState(0);
    const [incidencia, setIncidencia] = useState<Incidencia>("ninguna");
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const hora = new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });

    const reiniciar = () => {
        setPaso(1); setPiezas(0); setDefect(0);
        setIncidencia("ninguna"); setGuardado(false);
    };

    const guardar = async () => {
        setGuardando(true);
        await new Promise(r => setTimeout(r, 1200));
        setGuardando(false);
        setGuardado(true);
    };

    // ── Pantalla éxito ──
    if (guardado) return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "rgba(52,211,153,0.15)" }}>
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="text-center">
                <p className="text-2xl font-black text-white">¡Registro guardado!</p>
                <p className="text-sm mt-2" style={{ color: C.slate }}>{piezas} piezas registradas · {hora}</p>
                {incidencia !== "ninguna" && (
                    <p className="text-sm mt-1" style={{ color: C.amber }}>
                        Incidencia reportada: {INCIDENCIAS.find(i => i.id === incidencia)?.label}
                    </p>
                )}
            </div>
            <button onClick={reiniciar}
                className="flex items-center gap-2 h-14 px-8 rounded-2xl text-white font-bold text-base"
                style={{ background: C.orange, boxShadow: `0 8px 24px ${C.orange}40` }}>
                <RotateCcw className="w-5 h-5" /> Nuevo registro
            </button>
        </div>
    );

    return (
        <div className="flex-1 overflow-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: C.border, background: C.surface }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-black text-white">Registrar Producción</h1>
                        <p className="text-xs mt-0.5" style={{ color: C.slate }}>RF4 · RNF-04 — Máximo 3 interacciones</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                        <Clock className="w-3.5 h-3.5" style={{ color: C.slate }} />
                        <span className="text-sm font-mono text-white">{hora}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-xl mx-auto space-y-5">

                {/* Contexto del operario (siempre visible) */}
                <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
                    style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                        style={{ background: `${C.orange}20`, color: C.orange }}>CM</div>
                    <div className="flex-1">
                        <p className="font-bold text-white">{operario.nombre}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                                style={{ background: `${C.orange}18`, color: C.orange }}>{operario.maquina}</span>
                            <span className="text-xs" style={{ color: C.slate }}>{operario.orden}</span>
                        </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: C.emerald }} />
                </div>

                {/* Indicador de pasos */}
                <div className="flex items-center gap-2">
                    {[
                        { n: 1, l: "Confirmar" },
                        { n: 2, l: "Piezas" },
                        { n: 3, l: "Incidencia" },
                    ].map(({ n, l }, i) => (
                        <div key={n} className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-1.5 flex-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{
                                        background: paso > n ? C.emerald : paso === n ? C.orange : "#1e293b",
                                        color: "#fff",
                                        boxShadow: paso === n ? `0 0 0 4px ${C.orange}30` : "none",
                                    }}>
                                    {paso > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                                </div>
                                <span className="text-xs font-medium hidden sm:block"
                                    style={{ color: paso === n ? C.orange : paso > n ? C.emerald : "#475569" }}>{l}</span>
                            </div>
                            {i < 2 && <div className="h-0.5 flex-1 rounded" style={{ background: paso > n ? C.emerald : C.border }} />}
                        </div>
                    ))}
                </div>

                {/* ── PASO 1: Confirmar tarea (TAP 1) ── */}
                {paso === 1 && (
                    <div className="space-y-4">
                        <p className="text-base font-semibold text-white">¿Confirmas tu tarea actual?</p>
                        <div className="rounded-2xl p-5 space-y-3"
                            style={{ background: "#0d1018", border: `1.5px solid ${C.border}` }}>
                            {[
                                { label: "Orden", valor: operario.orden },
                                { label: "Máquina", valor: operario.maquina },
                                { label: "Operario", valor: operario.nombre },
                            ].map(r => (
                                <div key={r.label} className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: C.slate }}>{r.label}</span>
                                    <span className="text-sm font-bold text-white">{r.valor}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setPaso(2)}
                            className="w-full h-16 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                            style={{ background: C.orange, boxShadow: `0 8px 24px ${C.orange}40` }}>
                            ✓ Confirmar y continuar <ChevronRight className="w-5 h-5" />
                        </button>
                        <p className="text-center text-xs" style={{ color: "#334155" }}>
                            TAP 1 de 3 — Si tu tarea cambió, avisa al jefe de taller
                        </p>
                    </div>
                )}

                {/* ── PASO 2: Contar piezas (TAP 2) ── */}
                {paso === 2 && (
                    <div className="space-y-4">
                        <p className="text-base font-semibold text-white">¿Cuántas piezas terminaste?</p>
                        <ContadorTactil label="Piezas producidas" value={piezas} onChange={setPiezas} color={C.orange} />
                        <ContadorTactil label="Piezas defectuosas" value={defectuosas} onChange={v => setDefect(Math.min(v, piezas))} color={C.red} />

                        {piezas > 0 && (
                            <div className="px-4 py-3 rounded-xl flex items-center justify-between"
                                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                                <span className="text-sm" style={{ color: C.emerald }}>Piezas buenas</span>
                                <span className="text-xl font-black font-mono" style={{ color: C.emerald }}>{piezas - defectuosas}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => setPaso(1)}
                                className="h-14 px-6 rounded-2xl border font-semibold"
                                style={{ borderColor: C.border, color: "#94a3b8" }}>Atrás</button>
                            <button onClick={() => setPaso(3)} disabled={piezas === 0}
                                className="flex-1 h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                                style={{ background: piezas > 0 ? C.orange : "#334155", boxShadow: piezas > 0 ? `0 6px 20px ${C.orange}40` : "none" }}>
                                Siguiente <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-center text-xs" style={{ color: "#334155" }}>TAP 2 de 3</p>
                    </div>
                )}

                {/* ── PASO 3: Incidencia (TAP 3 = guardar) ── */}
                {paso === 3 && (
                    <div className="space-y-4">
                        <p className="text-base font-semibold text-white">¿Hubo alguna incidencia?</p>
                        <div className="grid grid-cols-2 gap-3">
                            {INCIDENCIAS.map(inc => (
                                <button key={inc.id} onClick={() => setIncidencia(inc.id)}
                                    className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all active:scale-95"
                                    style={{
                                        borderColor: incidencia === inc.id ? inc.color : C.border,
                                        background: incidencia === inc.id ? `${inc.color}12` : C.surface,
                                    }}>
                                    <span style={{ color: incidencia === inc.id ? inc.color : "#475569" }}>{inc.icon}</span>
                                    <span className="text-sm font-semibold text-center"
                                        style={{ color: incidencia === inc.id ? inc.color : "#94a3b8" }}>{inc.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Resumen antes de guardar */}
                        <div className="rounded-xl p-4 space-y-2" style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: C.slate }}>Resumen del registro</p>
                            {[
                                { l: "Piezas producidas", v: piezas, c: C.orange },
                                { l: "Piezas buenas", v: piezas - defectuosas, c: C.emerald },
                                { l: "Defectuosas", v: defectuosas, c: C.red },
                                { l: "Incidencia", v: INCIDENCIAS.find(i => i.id === incidencia)?.label ?? "", c: "#94a3b8" },
                            ].map(r => (
                                <div key={r.l} className="flex justify-between">
                                    <span className="text-xs" style={{ color: C.slate }}>{r.l}</span>
                                    <span className="text-xs font-bold" style={{ color: r.c }}>{r.v}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setPaso(2)}
                                className="h-14 px-6 rounded-2xl border font-semibold"
                                style={{ borderColor: C.border, color: "#94a3b8" }}>Atrás</button>
                            <button onClick={guardar} disabled={guardando}
                                className="flex-1 h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                                style={{ background: C.emerald, boxShadow: `0 6px 20px rgba(52,211,153,0.35)` }}>
                                {guardando ? "Guardando..." : <><CheckCircle2 className="w-5 h-5" /> Guardar registro</>}
                            </button>
                        </div>
                        <p className="text-center text-xs" style={{ color: "#334155" }}>TAP 3 de 3 — Último paso</p>
                    </div>
                )}
            </div>
        </div>
    );
}