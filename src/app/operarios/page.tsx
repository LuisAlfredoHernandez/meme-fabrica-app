"use client";
// ─────────────────────────────────────────────────────────────
// app/operarios/page.tsx — RF2 (RRHH) + RF3 (Asignación tareas)
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Plus, Search, X, User, Zap, Award, CheckCircle2, Clock } from "lucide-react";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", slate: "#475569",
};

type Maquina = "merrow" | "cover" | "plana" | "corte" | "plancha_dtf" | "peso";

interface Operario {
    id: string; nombre: string; apellido: string;
    maquinas: Maquina[]; eficiencia: number;
    estado: "activo" | "ausente" | "descanso";
    maquinaActual?: string; ordenActual?: string;
    turno: "manana" | "tarde";
}

const MAQUINAS_DISPONIBLES: { tipo: Maquina; codigos: string[]; color: string }[] = [
    { tipo: "merrow", codigos: ["MERROW-01", "MERROW-02", "MERROW-03"], color: "#f97316" },
    { tipo: "cover", codigos: ["COVER-01", "COVER-02"], color: "#818cf8" },
    { tipo: "plana", codigos: ["PLANA-01"], color: "#38bdf8" },
    { tipo: "corte", codigos: ["CORTE-01", "CORTE-02"], color: "#fbbf24" },
    { tipo: "plancha_dtf", codigos: ["DTF-01", "DTF-02"], color: "#f472b6" },
    { tipo: "peso", codigos: ["PESO-01"], color: "#34d399" },
];

const MOCK_OPERARIOS: Operario[] = [
    { id: "e1", nombre: "Carmen", apellido: "Méndez", maquinas: ["merrow", "cover"], eficiencia: 88, estado: "activo", maquinaActual: "MERROW-01", ordenActual: "ORD-2026-0042", turno: "manana" },
    { id: "e2", nombre: "Josué", apellido: "Reyes", maquinas: ["cover", "plana"], eficiencia: 74, estado: "activo", maquinaActual: "COVER-02", ordenActual: "ORD-2026-0042", turno: "manana" },
    { id: "e3", nombre: "María", apellido: "Santos", maquinas: ["corte"], eficiencia: 91, estado: "activo", maquinaActual: "CORTE-01", ordenActual: "ORD-2026-0043", turno: "manana" },
    { id: "e4", nombre: "Rafael", apellido: "Núñez", maquinas: ["merrow", "plana"], eficiencia: 82, estado: "descanso", turno: "manana" },
    { id: "e5", nombre: "Paola", apellido: "Herrera", maquinas: ["plancha_dtf"], eficiencia: 79, estado: "ausente", turno: "tarde" },
    { id: "e6", nombre: "Luis", apellido: "Castro", maquinas: ["merrow", "cover", "plana"], eficiencia: 95, estado: "activo", maquinaActual: "MERROW-02", ordenActual: "ORD-2026-0043", turno: "tarde" },
];

const ESTADO_CFG = {
    activo: { color: "#34d399", label: "Activo", bg: "rgba(52,211,153,0.12)" },
    ausente: { color: "#f87171", label: "Ausente", bg: "rgba(248,113,113,0.12)" },
    descanso: { color: "#fbbf24", label: "Descanso", bg: "rgba(251,191,36,0.12)" },
};

// ── Modal asignación ──────────────────────────────────────

function ModalAsignacion({ operario, onClose }: { operario: Operario; onClose: () => void }) {
    const [maquina, setMaquina] = useState(operario.maquinaActual ?? "");
    const [orden, setOrden] = useState(operario.ordenActual ?? "");

    const maqsHabilitadas = MAQUINAS_DISPONIBLES
        .filter(m => operario.maquinas.includes(m.tipo))
        .flatMap(m => m.codigos.map(c => ({ codigo: c, color: m.color, tipo: m.tipo })));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                    <div>
                        <h2 className="font-bold text-white">Asignar tarea</h2>
                        <p className="text-xs mt-0.5" style={{ color: C.slate }}>{operario.nombre} {operario.apellido}</p>
                    </div>
                    <button onClick={onClose} style={{ color: C.slate }}><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Máquinas habilitadas */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
                            Máquina (certificadas para este operario)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {maqsHabilitadas.map(m => (
                                <button key={m.codigo} onClick={() => setMaquina(m.codigo)}
                                    className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                                    style={{
                                        borderColor: maquina === m.codigo ? m.color : C.border,
                                        background: maquina === m.codigo ? `${m.color}12` : "#0d1018",
                                    }}>
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                                    <div>
                                        <p className="text-xs font-bold text-white">{m.codigo}</p>
                                        <p className="text-xs capitalize" style={{ color: C.slate }}>{m.tipo.replace("_", " ")}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orden */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Orden de producción</label>
                        <select value={orden} onChange={e => setOrden(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl text-sm text-white appearance-none focus:outline-none"
                            style={{ background: "#0d1018", border: `1.5px solid ${orden ? C.orange : C.border}` }}>
                            <option value="">— Sin asignar —</option>
                            <option value="ORD-2026-0042">ORD-2026-0042 · Boutique Bella (urgente)</option>
                            <option value="ORD-2026-0043">ORD-2026-0043 · ModaRD Store (alta)</option>
                            <option value="ORD-2026-0044">ORD-2026-0044 · Stock interno (normal)</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose}
                        className="flex-1 h-11 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: C.border, color: "#94a3b8" }}>Cancelar</button>
                    <button onClick={onClose}
                        className="flex-1 h-11 rounded-xl text-white text-sm font-bold"
                        style={{ background: C.orange }}>
                        Confirmar asignación
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Página principal ───────────────────────────────────────

export default function OperariosPage() {
    const [operarios] = useState(MOCK_OPERARIOS);
    const [busqueda, setBusq] = useState("");
    const [asignando, setAsig] = useState<Operario | null>(null);
    const [modal, setModal] = useState(false);

    const filtrados = operarios.filter(o =>
        `${o.nombre} ${o.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    const activos = operarios.filter(o => o.estado === "activo").length;
    const ausentes = operarios.filter(o => o.estado === "ausente").length;

    return (
        <div className="flex-1 overflow-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {asignando && <ModalAsignacion operario={asignando} onClose={() => setAsig(null)} />}

            {/* Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border, background: C.surface }}>
                <div>
                    <h1 className="text-lg font-black text-white">Operarios y Asignación</h1>
                    <p className="text-xs mt-0.5" style={{ color: C.slate }}>RF2 · RF3 — Gestión de personal y estaciones</p>
                </div>
                <button onClick={() => setModal(true)}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold"
                    style={{ background: C.orange }}>
                    <Plus className="w-4 h-4" /> Nuevo operario
                </button>
            </div>

            <div className="p-6 space-y-5">

                {/* KPIs */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Total operarios", valor: operarios.length, color: "#fff" },
                        { label: "Activos ahora", valor: activos, color: C.emerald },
                        { label: "Ausentes", valor: ausentes, color: C.red },
                        { label: "Eficiencia prom.", valor: `${Math.round(operarios.reduce((a, o) => a + o.eficiencia, 0) / operarios.length)}%`, color: C.orange },
                    ].map(k => (
                        <div key={k.label} className="rounded-xl px-4 py-3"
                            style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <p className="text-xs mb-1" style={{ color: C.slate }}>{k.label}</p>
                            <p className="text-2xl font-black font-mono" style={{ color: k.color }}>{k.valor}</p>
                        </div>
                    ))}
                </div>

                {/* Búsqueda */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.slate }} />
                    <input value={busqueda} onChange={e => setBusq(e.target.value)}
                        placeholder="Buscar operario..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white focus:outline-none"
                        style={{ background: C.surface, border: `1px solid ${C.border}` }} />
                </div>

                {/* Cards de operarios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtrados.map(o => {
                        const est = ESTADO_CFG[o.estado];
                        return (
                            <div key={o.id} className="rounded-2xl overflow-hidden"
                                style={{ background: C.surface, border: `1px solid ${C.border}` }}>

                                {/* Card header */}
                                <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: C.border }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                                        style={{ background: `${est.color}20`, color: est.color }}>
                                        {o.nombre[0]}{o.apellido[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white text-sm">{o.nombre} {o.apellido}</p>
                                        <p className="text-xs capitalize" style={{ color: C.slate }}>Turno {o.turno}</p>
                                    </div>
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                        style={{ background: est.bg, color: est.color }}>{est.label}</span>
                                </div>

                                {/* Métricas */}
                                <div className="px-4 py-3 space-y-3">
                                    {/* Eficiencia */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1" style={{ color: C.slate }}>
                                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Eficiencia</span>
                                            <span className="font-mono font-bold" style={{ color: o.eficiencia >= 85 ? C.emerald : o.eficiencia >= 70 ? C.amber : C.red }}>
                                                {o.eficiencia}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                                            <div className="h-full rounded-full" style={{
                                                width: `${o.eficiencia}%`,
                                                background: o.eficiencia >= 85 ? C.emerald : o.eficiencia >= 70 ? C.amber : C.red,
                                            }} />
                                        </div>
                                    </div>

                                    {/* Máquinas certificadas */}
                                    <div>
                                        <p className="text-xs mb-1.5" style={{ color: C.slate }}>Máquinas certificadas</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {o.maquinas.map(m => {
                                                const cfg = MAQUINAS_DISPONIBLES.find(md => md.tipo === m);
                                                return (
                                                    <span key={m} className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                                                        style={{ background: `${cfg?.color ?? "#fff"}15`, color: cfg?.color ?? "#fff" }}>
                                                        {m.replace("_", " ")}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Asignación actual */}
                                    {o.estado === "activo" && o.maquinaActual && (
                                        <div className="px-3 py-2 rounded-xl flex items-center gap-2"
                                            style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: C.emerald }} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white">{o.maquinaActual}</p>
                                                <p className="text-xs truncate" style={{ color: C.slate }}>{o.ordenActual}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Acción asignar */}
                                <div className="px-4 pb-4">
                                    <button onClick={() => setAsig(o)}
                                        className="w-full h-9 rounded-xl border text-xs font-semibold transition-all"
                                        style={{ borderColor: C.border, color: "#94a3b8" }}>
                                        {o.maquinaActual ? "Reasignar tarea" : "Asignar tarea"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}