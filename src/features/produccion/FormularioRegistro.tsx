"use client";

// ============================================================
// features/produccion/FormularioRegistro.tsx
// Meme Fábricas · Registro de Producción Diaria
// ============================================================

import { useState, useCallback } from "react";
import {
    Scissors,
    Layers,
    Printer,
    Package,
    Clock,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Loader2,
    RotateCcw,
} from "lucide-react";
import type {
    EtapaProduccion,
    TipoMaquina,
    RegistroProduccion,
    Maquina,
    Orden,
} from "@/types";

// ─── Datos de apoyo para UI ──────────────────────────────────

const ETAPAS: {
    valor: EtapaProduccion;
    label: string;
    descripcion: string;
    icono: React.ReactNode;
    color: string;
    bg: string;
    border: string;
}[] = [
        {
            valor: "corte",
            label: "Corte",
            descripcion: "Corte de tela y piezas",
            icono: <Scissors className="w-6 h-6" />,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/30",
        },
        {
            valor: "confeccion",
            label: "Confección",
            descripcion: "Costura y ensamble",
            icono: <Layers className="w-6 h-6" />,
            color: "text-sky-400",
            bg: "bg-sky-400/10",
            border: "border-sky-400/30",
        },
        {
            valor: "estampado",
            label: "Estampado",
            descripcion: "DTF, serigrafía",
            icono: <Printer className="w-6 h-6" />,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/30",
        },
        {
            valor: "acabado",
            label: "Acabado",
            descripcion: "Revisión y empaque",
            icono: <Package className="w-6 h-6" />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/30",
        },
    ];

const MAQUINAS_POR_ETAPA: Record<
    EtapaProduccion,
    { tipo: TipoMaquina; label: string }[]
> = {
    corte: [{ tipo: "corte", label: "Máquina de Corte" }],
    confeccion: [
        { tipo: "merrow", label: "Merrow" },
        { tipo: "cover", label: "Cover" },
        { tipo: "plana", label: "Plana" },
    ],
    estampado: [{ tipo: "plancha_dtf", label: "Plancha DTF" }],
    acabado: [
        { tipo: "peso", label: "Peso" },
        { tipo: "plancha_dtf", label: "Plancha DTF" },
    ],
};

// ─── Props ───────────────────────────────────────────────────

interface FormularioRegistroProps {
    empleadoId: string;
    ordenesActivas: Orden[];
    maquinasDisponibles: Maquina[];
    onSubmit: (registro: Omit<RegistroProduccion, "id" | "sincronizado">) => Promise<void>;
    onCancel?: () => void;
}

// ─── Estado del formulario ───────────────────────────────────

interface FormState {
    ordenId: string;
    etapa: EtapaProduccion | "";
    maquinaId: string;
    horaInicio: string;
    horaFin: string;
    piezasProducidas: string;
    piezasDefectuosas: string;
    tiempoParadaMinutos: string;
    motivoParada: string;
    observaciones: string;
}

const INITIAL_STATE: FormState = {
    ordenId: "",
    etapa: "",
    maquinaId: "",
    horaInicio: "",
    horaFin: "",
    piezasProducidas: "",
    piezasDefectuosas: "",
    tiempoParadaMinutos: "0",
    motivoParada: "",
    observaciones: "",
};

// ─── Componente Principal ─────────────────────────────────────

export function FormularioRegistro({
    empleadoId,
    ordenesActivas,
    maquinasDisponibles,
    onSubmit,
    onCancel,
}: FormularioRegistroProps) {
    const [form, setForm] = useState<FormState>(INITIAL_STATE);
    const [paso, setPaso] = useState<1 | 2 | 3>(1);
    const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({});
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);

    // Hora actual para default
    const ahora = new Date().toTimeString().slice(0, 5);

    const set = useCallback(
        (campo: keyof FormState, valor: string) => {
            setForm((prev) => ({ ...prev, [campo]: valor }));
            setErrores((prev) => ({ ...prev, [campo]: undefined }));
        },
        []
    );

    // Máquinas filtradas según etapa y disponibilidad
    const maquinasFiltradas = form.etapa
        ? maquinasDisponibles.filter((m) => {
            const tiposValidos = MAQUINAS_POR_ETAPA[form.etapa as EtapaProduccion].map(
                (x) => x.tipo
            );
            return tiposValidos.includes(m.tipo) && m.estado === "activa";
        })
        : [];

    // Orden seleccionada
    const ordenSeleccionada = ordenesActivas.find((o) => o.id === form.ordenId);

    // ── Validaciones por paso ──

    const validarPaso1 = () => {
        const e: typeof errores = {};
        if (!form.ordenId) e.ordenId = "Selecciona una orden";
        if (!form.etapa) e.etapa = "Selecciona una etapa";
        if (!form.maquinaId) e.maquinaId = "Selecciona una máquina";
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const validarPaso2 = () => {
        const e: typeof errores = {};
        if (!form.horaInicio) e.horaInicio = "Ingresa la hora de inicio";
        if (!form.horaFin) e.horaFin = "Ingresa la hora de fin";
        if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio)
            e.horaFin = "La hora de fin debe ser posterior al inicio";
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const validarPaso3 = () => {
        const e: typeof errores = {};
        const piezas = parseInt(form.piezasProducidas);
        const defectuosas = parseInt(form.piezasDefectuosas);
        if (!form.piezasProducidas || isNaN(piezas) || piezas < 0)
            e.piezasProducidas = "Ingresa un número válido";
        if (isNaN(defectuosas) || defectuosas < 0)
            e.piezasDefectuosas = "Ingresa un número válido";
        if (!isNaN(piezas) && !isNaN(defectuosas) && defectuosas > piezas)
            e.piezasDefectuosas = "No pueden superar las piezas producidas";
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const siguiente = () => {
        if (paso === 1 && validarPaso1()) setPaso(2);
        else if (paso === 2 && validarPaso2()) setPaso(3);
    };

    const enviar = async () => {
        if (!validarPaso3()) return;
        setEnviando(true);
        try {
            const hoy = new Date().toISOString().split("T")[0];
            await onSubmit({
                ordenId: form.ordenId,
                empleadoId,
                maquinaId: form.maquinaId,
                etapa: form.etapa as EtapaProduccion,
                fecha: hoy,
                horaInicio: form.horaInicio,
                horaFin: form.horaFin || undefined,
                piezasProducidas: parseInt(form.piezasProducidas) || 0,
                piezasDefectuosas: parseInt(form.piezasDefectuosas) || 0,
                tiempoParadaMinutos: parseInt(form.tiempoParadaMinutos) || 0,
                motivoParada: form.motivoParada || undefined,
                observaciones: form.observaciones || undefined,
            });
            setExito(true);
            setTimeout(() => {
                setExito(false);
                setForm(INITIAL_STATE);
                setPaso(1);
            }, 2000);
        } finally {
            setEnviando(false);
        }
    };

    const reiniciar = () => {
        setForm(INITIAL_STATE);
        setPaso(1);
        setErrores({});
    };

    // ── Eficiencia en tiempo real ──
    const eficienciaEstimada = (() => {
        const maquina = maquinasDisponibles.find((m) => m.id === form.maquinaId);
        if (!maquina || !form.horaInicio || !form.horaFin || !form.piezasProducidas) return null;
        const [hI, mI] = form.horaInicio.split(":").map(Number);
        const [hF, mF] = form.horaFin.split(":").map(Number);
        const horas = (hF * 60 + mF - (hI * 60 + mI)) / 60;
        const paradaHoras = (parseInt(form.tiempoParadaMinutos) || 0) / 60;
        const horasEfectivas = Math.max(horas - paradaHoras, 0);
        if (horasEfectivas === 0) return null;
        const capacidadEsperada = maquina.capacidadPorHora * horasEfectivas;
        return Math.min(
            Math.round((parseInt(form.piezasProducidas) / capacidadEsperada) * 100),
            150
        );
    })();

    // ── Pantalla de éxito ──
    if (exito) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-[#0f1117] rounded-2xl border border-emerald-500/30 p-8">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <p className="text-xl font-semibold text-white">¡Registro guardado!</p>
                <p className="text-slate-400 text-sm">La producción fue registrada exitosamente.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0f1117] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-sans">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-[#13161e]">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            Registrar Producción
                        </h2>
                        <p className="text-slate-400 text-sm mt-0.5">
                            Completa los datos de tu turno
                        </p>
                    </div>
                    <button
                        onClick={reiniciar}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Reiniciar formulario"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>

                {/* Indicador de pasos */}
                <div className="flex items-center gap-2 mt-5">
                    {[
                        { n: 1, label: "Tarea" },
                        { n: 2, label: "Horario" },
                        { n: 3, label: "Producción" },
                    ].map(({ n, label }, i) => (
                        <div key={n} className="flex items-center gap-2 flex-1">
                            <div
                                className={`flex items-center gap-2 flex-1 ${paso >= n ? "opacity-100" : "opacity-40"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${paso > n
                                        ? "bg-emerald-500 text-white"
                                        : paso === n
                                            ? "bg-orange-500 text-white ring-4 ring-orange-500/20"
                                            : "bg-slate-700 text-slate-400"
                                        }`}
                                >
                                    {paso > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                                </div>
                                <span
                                    className={`text-xs font-medium hidden sm:block ${paso === n ? "text-orange-400" : paso > n ? "text-emerald-400" : "text-slate-500"
                                        }`}
                                >
                                    {label}
                                </span>
                            </div>
                            {i < 2 && (
                                <div
                                    className={`h-0.5 flex-1 mx-1 rounded transition-all duration-500 ${paso > n ? "bg-emerald-500" : "bg-slate-700"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Cuerpo del formulario */}
            <div className="p-6 space-y-6">

                {/* ── PASO 1: Tarea ── */}
                {paso === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Orden */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 block">
                                Orden de Producción
                            </label>
                            <select
                                value={form.ordenId}
                                onChange={(e) => set("ordenId", e.target.value)}
                                className={`w-full h-14 px-4 rounded-xl bg-slate-900 border text-white text-base appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${errores.ordenId ? "border-red-500" : "border-slate-700 focus:border-orange-500"
                                    }`}
                            >
                                <option value="">— Selecciona una orden —</option>
                                {ordenesActivas.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.numero} · {o.cliente} ({o.totalPiezas - o.totalCompletadas} restantes)
                                    </option>
                                ))}
                            </select>
                            {errores.ordenId && (
                                <p className="text-red-400 text-xs flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errores.ordenId}
                                </p>
                            )}
                            {ordenSeleccionada && (
                                <div className="flex items-center gap-3 mt-2 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400">Progreso de la orden</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.round(
                                                            (ordenSeleccionada.totalCompletadas /
                                                                ordenSeleccionada.totalPiezas) *
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono text-orange-400 shrink-0">
                                                {ordenSeleccionada.totalCompletadas}/{ordenSeleccionada.totalPiezas}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Etapa */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 block">
                                Etapa de Producción
                            </label>
                            {errores.etapa && (
                                <p className="text-red-400 text-xs flex items-center gap-1 mb-1">
                                    <AlertCircle className="w-3 h-3" /> {errores.etapa}
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                {ETAPAS.map((e) => (
                                    <button
                                        key={e.valor}
                                        type="button"
                                        onClick={() => {
                                            set("etapa", e.valor);
                                            set("maquinaId", "");
                                        }}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${form.etapa === e.valor
                                            ? `${e.bg} ${e.border} border-2`
                                            : "bg-slate-900 border-slate-800 hover:border-slate-600"
                                            }`}
                                    >
                                        <span className={form.etapa === e.valor ? e.color : "text-slate-500"}>
                                            {e.icono}
                                        </span>
                                        <div>
                                            <p
                                                className={`font-semibold text-sm ${form.etapa === e.valor ? "text-white" : "text-slate-300"
                                                    }`}
                                            >
                                                {e.label}
                                            </p>
                                            <p className="text-xs text-slate-500">{e.descripcion}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Máquina */}
                        {form.etapa && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 block">
                                    Máquina Utilizada
                                </label>
                                {errores.maquinaId && (
                                    <p className="text-red-400 text-xs flex items-center gap-1 mb-1">
                                        <AlertCircle className="w-3 h-3" /> {errores.maquinaId}
                                    </p>
                                )}
                                {maquinasFiltradas.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic py-2">
                                        No hay máquinas activas para esta etapa.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {maquinasFiltradas.map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => set("maquinaId", m.id)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${form.maquinaId === m.id
                                                    ? "bg-orange-500/10 border-orange-500/50"
                                                    : "bg-slate-900 border-slate-800 hover:border-slate-600"
                                                    }`}
                                            >
                                                <p
                                                    className={`font-bold text-sm ${form.maquinaId === m.id ? "text-orange-400" : "text-white"
                                                        }`}
                                                >
                                                    {m.codigo}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">{m.nombre}</p>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    ~{m.capacidadPorHora} pzs/hr
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PASO 2: Horario ── */}
                {paso === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            {(
                                [
                                    {
                                        campo: "horaInicio" as keyof FormState,
                                        label: "Hora de Inicio",
                                        default: ahora,
                                    },
                                    { campo: "horaFin" as keyof FormState, label: "Hora de Fin" },
                                ] as const
                            ).map(({ campo, label, default: def }) => (
                                <div key={campo} className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                        {label}
                                    </label>
                                    <input
                                        type="time"
                                        value={form[campo]}
                                        onChange={(e) => set(campo, e.target.value)}
                                        defaultValue={def}
                                        className={`w-full h-14 px-4 rounded-xl bg-slate-900 border text-white text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors ${errores[campo]
                                            ? "border-red-500"
                                            : "border-slate-700 focus:border-orange-500"
                                            }`}
                                    />
                                    {errores[campo] && (
                                        <p className="text-red-400 text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errores[campo]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 block">
                                Tiempo de Parada (minutos)
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {[0, 5, 10, 15, 30, 45, 60].map((min) => (
                                    <button
                                        key={min}
                                        type="button"
                                        onClick={() => set("tiempoParadaMinutos", String(min))}
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${form.tiempoParadaMinutos === String(min)
                                            ? "bg-orange-500 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                            }`}
                                    >
                                        {min} min
                                    </button>
                                ))}
                            </div>
                            {parseInt(form.tiempoParadaMinutos) > 0 && (
                                <div className="mt-3 space-y-1">
                                    <label className="text-xs text-slate-400">Motivo de la parada</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: falla en máquina, espera de insumo..."
                                        value={form.motivoParada}
                                        onChange={(e) => set("motivoParada", e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── PASO 3: Producción ── */}
                {paso === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                {
                                    campo: "piezasProducidas" as keyof FormState,
                                    label: "Piezas Producidas",
                                    color: "orange",
                                    placeholder: "0",
                                },
                                {
                                    campo: "piezasDefectuosas" as keyof FormState,
                                    label: "Piezas Defectuosas",
                                    color: "red",
                                    placeholder: "0",
                                },
                            ].map(({ campo, label, color, placeholder }) => (
                                <div key={campo} className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 block">
                                        {label}
                                    </label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        placeholder={placeholder}
                                        value={form[campo]}
                                        onChange={(e) => set(campo, e.target.value)}
                                        className={`w-full h-16 px-4 rounded-xl bg-slate-900 border text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 transition-colors ${errores[campo]
                                            ? "border-red-500 focus:ring-red-500/50"
                                            : color === "orange"
                                                ? "border-slate-700 focus:border-orange-500 focus:ring-orange-500/50"
                                                : "border-slate-700 focus:border-red-500 focus:ring-red-500/50"
                                            }`}
                                    />
                                    {errores[campo] && (
                                        <p className="text-red-400 text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errores[campo]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Eficiencia en tiempo real */}
                        {eficienciaEstimada !== null && (
                            <div
                                className={`p-4 rounded-xl border ${eficienciaEstimada >= 90
                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                    : eficienciaEstimada >= 70
                                        ? "bg-amber-500/10 border-amber-500/30"
                                        : "bg-red-500/10 border-red-500/30"
                                    }`}
                            >
                                <p className="text-xs text-slate-400 mb-1">Eficiencia estimada del turno</p>
                                <div className="flex items-end gap-3">
                                    <span
                                        className={`text-4xl font-black ${eficienciaEstimada >= 90
                                            ? "text-emerald-400"
                                            : eficienciaEstimada >= 70
                                                ? "text-amber-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        {eficienciaEstimada}%
                                    </span>
                                    <span className="text-slate-500 text-sm mb-1">
                                        {eficienciaEstimada >= 90
                                            ? "¡Excelente rendimiento!"
                                            : eficienciaEstimada >= 70
                                                ? "Rendimiento aceptable"
                                                : "Por debajo de la meta"}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${eficienciaEstimada >= 90
                                            ? "bg-emerald-500"
                                            : eficienciaEstimada >= 70
                                                ? "bg-amber-500"
                                                : "bg-red-500"
                                            }`}
                                        style={{ width: `${Math.min(eficienciaEstimada, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Observaciones */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 block">
                                Observaciones{" "}
                                <span className="text-slate-600 font-normal">(opcional)</span>
                            </label>
                            <textarea
                                placeholder="Comenta cualquier situación relevante del turno..."
                                value={form.observaciones}
                                onChange={(e) => set("observaciones", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer — botones de navegación */}
            <div className="px-6 pb-6 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={paso === 1 ? onCancel : () => setPaso((p) => (p - 1) as 1 | 2 | 3)}
                    className="h-14 px-6 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 active:scale-95 transition-all"
                >
                    {paso === 1 ? "Cancelar" : "Atrás"}
                </button>

                {paso < 3 ? (
                    <button
                        type="button"
                        onClick={siguiente}
                        className="flex-1 h-14 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                    >
                        Siguiente
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={enviar}
                        disabled={enviando}
                        className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {enviando ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Guardar Registro
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default FormularioRegistro;