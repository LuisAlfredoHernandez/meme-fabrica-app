"use client";
// ─────────────────────────────────────────────────────────────
// app/ia/page.tsx — RF12-RF16 (Predicciones) + RF19-RF22 (Gestión IA)
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import {
    Brain, AlertTriangle, TrendingUp, TrendingDown, Zap, Package,
    RefreshCw, CheckCircle2, X, ArrowRight, UserCheck,
    BarChart3, Shield, Info, Clock, ChevronDown, Play,
    AlertCircle, Database, GitCompare, Bell, DatabaseZap,
    Upload, FileSpreadsheet, Trash2, HelpCircle
} from "lucide-react";
import {
    ResponsiveContainer, ComposedChart, Area, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import {
    getProjectionsAction,
    getBottlenecksAction,
    simulateMtsAction,
    trainModelAction,
    seedDataAction,
    uploadTrainDataAction,
    getIaStatusAction,
    predictDeliveryTimeAction,
    predictOrderItemsAction,
    exportHistoryAction,
    getActiveDelaysAction
} from "@/features/ia-predictiva/actions/ia.actions";
import { useOrdenStore } from "@/features/ordenes/store/useOrdenesStore";

const AppColors = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", amber: "#fbbf24",
    red: "#f87171", violet: "#818cf8", sky: "#38bdf8", slate: "#475569",
};

const NIVEL_CFG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
    critica: { color: AppColors.red, bg: `${AppColors.red}10`, border: `${AppColors.red}35`, icon: <Zap className="w-4 h-4" />, label: "Crítico" },
    advertencia: { color: AppColors.amber, bg: `${AppColors.amber}10`, border: `${AppColors.amber}35`, icon: <AlertTriangle className="w-4 h-4" />, label: "Advertencia" },
    info: { color: AppColors.sky, bg: `${AppColors.sky}10`, border: `${AppColors.sky}35`, icon: <Info className="w-4 h-4" />, label: "Info" },
};

const TooltipIA = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const map: Record<string, { n: string; color: string }> = {
        meta: { n: "Meta", color: "#475569" }, 
        real: { n: "Real", color: AppColors.orange }, 
        pred: { n: "Predicción IA", color: AppColors.violet },
    };
    return (
        <div className="p-3 rounded-xl text-xs shadow-2xl" style={{ background: "#1a1d28", border: `1px solid ${AppColors.border}` }}>
            <p className="mb-2 font-medium" style={{ color: "#64748b" }}>{label}</p>
            {payload.map((p: any) => p.value != null && map[p.dataKey] ? (
                <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
                    <span className="flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: map[p.dataKey].color }} />
                        {map[p.dataKey].n}
                    </span>
                    <span className="font-bold font-mono text-white">{p.value} pzs</span>
                </div>
            ) : null)}
        </div>
    );
};

// ── Sección: Gestión del modelo IA (RF19–RF22) ────────────────
interface PanelProps {
    status: any;
    onSuccess: () => void;
}

function PanelGestionModelo({ status, onSuccess }: PanelProps) {
    const [reentrenando, setReentrena] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [resultado, setResultado] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { addToastOnly } = useNotificationActions();

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [exportando, setExportando] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [showExcelFormat, setShowExcelFormat] = useState(false);

    const ejecutarReentrenamiento = async () => {
        setReentrena(true);
        setErrorMsg(null);
        setResultado(null);
        try {
            const data = await trainModelAction();
            setResultado(data);
            addToastOnly("Reentrenamiento Exitoso", "El modelo de IA fue actualizado con éxito.", "success");
            onSuccess();
        } catch (e: any) {
            setErrorMsg(e.message || "Fallo en el pipeline de reentrenamiento.");
            addToastOnly("Error de Entrenamiento", e.message || "Error al entrenar el modelo.", "error");
        } finally {
            setReentrena(false);
        }
    };

    const sembrarDatos = async () => {
        setSeeding(true);
        setErrorMsg(null);
        try {
            const data = await seedDataAction();
            addToastOnly("Datos Sembrados", data.mensaje || "Datos históricos sembrados correctamente.", "success");
            onSuccess();
        } catch (e: any) {
            setErrorMsg(e.message || "Error al sembrar datos.");
        } finally {
            setSeeding(false);
        }
    };

    const subirYEntrenarExcel = async () => {
        if (!file) return;
        setUploading(true);
        setErrorMsg(null);
        setResultado(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const data = await uploadTrainDataAction(formData);
            setResultado(data);
            setFile(null);
            setConfirmText("");
            addToastOnly("Carga y Entrenamiento Exitoso", "Los datos históricos fueron importados y la IA ha sido recalibrada.", "success");
            onSuccess();
        } catch (e: any) {
            setErrorMsg(e.message || "Fallo al importar el archivo Excel o entrenar el modelo.");
            addToastOnly("Error de Carga", e.message || "Error al subir o entrenar el modelo.", "error");
        } finally {
            setUploading(false);
        }
    };

    const exportarHistorialCompleto = async () => {
        setExportando(true);
        try {
            const base64 = await exportHistoryAction();
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "historial_produccion.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            addToastOnly("Exportación Exitosa", "El historial de producción ha sido exportado a Excel.", "success");
        } catch (e: any) {
            addToastOnly("Error al Exportar", e.message || "Fallo al exportar el historial.", "error");
        } finally {
            setExportando(false);
        }
    };

    const isCargado = status?.modelo_cargado;
    const algoritmo = status?.algoritmo_activo || "Ninguno";
    const registros = status?.registros_entrenados != null ? `${status.registros_entrenados} ord` : "0 ord";
    const fechaCalib = status?.fecha_calibracion 
        ? new Date(status.fecha_calibracion).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) 
        : "Sin calibrar";

    return (
        <div className="rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                <Database className="w-5 h-5" style={{ color: AppColors.violet }} />
                <h3 className="font-bold text-white text-sm">Gestión y Calibración del Modelo</h3>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${AppColors.violet}20`, color: AppColors.violet }}>RF19–RF22</span>
            </div>

            <div className="p-5 space-y-5">
                {/* Métricas actuales */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Modelo Activo", valor: isCargado ? "Calibrado" : "Inactivo", icon: <Shield className="w-4 h-4" />, color: isCargado ? AppColors.emerald : AppColors.amber },
                        { label: "Registros Entrenados", valor: registros, icon: <CheckCircle2 className="w-4 h-4" />, color: isCargado ? AppColors.sky : AppColors.slate },
                        { label: "Algoritmo Activo", valor: algoritmo, icon: <Brain className="w-4 h-4" />, color: isCargado ? AppColors.violet : AppColors.slate },
                        { label: "Última Calibración", valor: fechaCalib, icon: <Clock className="w-4 h-4" />, color: isCargado ? AppColors.emerald : AppColors.slate },
                    ].map(m => (
                        <div key={m.label} className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                            <span className="mt-0.5" style={{ color: m.color }}>{m.icon}</span>
                            <div>
                                <p className="text-xs" style={{ color: AppColors.slate }}>{m.label}</p>
                                <p className="text-sm font-black font-mono mt-0.5" style={{ color: m.color }}>{m.valor}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Importación de Excel Histórico */}
                <div className="p-4 rounded-xl border border-dashed border-[#1e2130] bg-[#0d1018]/50 space-y-3">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">Importar Historial (Excel)</span>
                        <span title="Sube una plantilla Excel con el historial para calibrar la IA">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-400" />
                        </span>
                        <button 
                            onClick={() => setShowExcelFormat(!showExcelFormat)}
                            className="ml-auto text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                        >
                            {showExcelFormat ? "Ocultar formato requerido" : "Ver formato requerido"}
                        </button>
                    </div>

                    {showExcelFormat && (
                        <div className="p-3 bg-[#090b10] rounded-xl border border-indigo-500/20 text-xs">
                            <p className="text-slate-300 mb-2 font-medium">El archivo Excel (.xlsx o .xls) debe contener <strong>exactamente</strong> las siguientes columnas en la primera fila:</p>
                            <div className="overflow-x-auto border border-white/5 rounded-lg">
                                <table className="w-full text-left text-[10px]">
                                    <thead className="bg-slate-800/50 text-slate-400 uppercase">
                                        <tr>
                                            <th className="p-2 whitespace-nowrap">Fecha</th>
                                            <th className="p-2 whitespace-nowrap">Número de Orden</th>
                                            <th className="p-2 whitespace-nowrap">Cliente</th>
                                            <th className="p-2 whitespace-nowrap">Tipo</th>
                                            <th className="p-2 whitespace-nowrap">Prioridad</th>
                                            <th className="p-2 whitespace-nowrap">Operario</th>
                                            <th className="p-2 whitespace-nowrap">Máquina</th>
                                            <th className="p-2 whitespace-nowrap">Prenda</th>
                                            <th className="p-2 whitespace-nowrap">Piezas Requeridas</th>
                                            <th className="p-2 whitespace-nowrap">Piezas Buenas</th>
                                            <th className="p-2 whitespace-nowrap">Piezas Defectuosas</th>
                                            <th className="p-2 whitespace-nowrap">Horas de Costura</th>
                                            <th className="p-2 whitespace-nowrap">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                        <tr>
                                            <td className="p-2 whitespace-nowrap">2026-03-15</td>
                                            <td className="p-2 whitespace-nowrap font-mono">ORD-2026-001</td>
                                            <td className="p-2 whitespace-nowrap">Nike Inc</td>
                                            <td className="p-2 whitespace-nowrap">MTO</td>
                                            <td className="p-2 whitespace-nowrap">alta</td>
                                            <td className="p-2 whitespace-nowrap">Juan Pérez</td>
                                            <td className="p-2 whitespace-nowrap">MERROW-01</td>
                                            <td className="p-2 whitespace-nowrap">camiseta</td>
                                            <td className="p-2 whitespace-nowrap font-mono">500</td>
                                            <td className="p-2 whitespace-nowrap font-mono">495</td>
                                            <td className="p-2 whitespace-nowrap font-mono">5</td>
                                            <td className="p-2 whitespace-nowrap font-mono">8.5</td>
                                            <td className="p-2 whitespace-nowrap text-emerald-400 font-bold">validado</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">
                                * Nota: Asegúrate de que no haya espacios al final de los nombres de las columnas. Se requiere al menos 1 día de registros validados y 2 órdenes.
                            </p>
                        </div>
                    )}
                    
                    {!file ? (
                        <label className="flex flex-col items-center justify-center border border-dashed border-[#1e2130] hover:border-indigo-500/50 rounded-xl p-6 cursor-pointer group transition-all bg-[#090b10]">
                            <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors duration-200" />
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Arrastra o selecciona tu archivo Excel</p>
                            <p className="text-[9px] text-slate-600 mt-1">Soporta .xlsx, .xls</p>
                            <input 
                                type="file" 
                                accept=".xlsx, .xls" 
                                className="hidden" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setFile(e.target.files[0]);
                                    }
                                }} 
                            />
                        </label>
                    ) : (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#1e2130] bg-[#090b10]">
                            <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-white font-bold truncate">{file.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button 
                                onClick={() => setFile(null)} 
                                className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {file && (
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={uploading}
                            className="w-full h-10 rounded-lg text-xs font-bold transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5"
                        >
                            <Play className="w-3.5 h-3.5" />
                            {uploading ? "Subiendo y entrenando..." : "Proceder con la Carga e IA"}
                        </button>
                    )}
                </div>

                {/* Guía de Salud de Datos */}
                <div className="p-4 rounded-xl border bg-indigo-500/5" style={{ borderColor: `${AppColors.violet}25` }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-white">Guía de Salud de Calibración</span>
                    </div>
                    <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
                        <li>
                            <strong className="text-slate-300">Piso Técnico Mínimo:</strong> 1 día de producción y 2 órdenes completadas (activa Regresión Lineal).
                        </li>
                        <li>
                            <strong className="text-slate-300">Volumen Saludable Mínimo:</strong> Al menos <strong className="text-indigo-400">10 órdenes</strong> en <strong className="text-indigo-400">3 días únicos</strong> (estabilidad en predicciones lineales).
                        </li>
                        <li>
                            <strong className="text-slate-300">Volumen Óptimo (Random Forest):</strong> Al menos <strong className="text-indigo-400">30 órdenes</strong> en <strong className="text-indigo-400">7 días únicos</strong> (activa estimaciones complejas basadas en eficiencia de operarios y prendas).
                        </li>
                    </ul>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 space-y-2 animate-in shake duration-300">
                        <div className="flex items-center gap-2 font-bold">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Error detectado (Pipeline)</span>
                        </div>
                        <p>{errorMsg}</p>
                        {errorMsg.includes("Suficiencia de datos") && (
                            <button
                                onClick={sembrarDatos}
                                disabled={seeding}
                                className="w-full mt-2 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-800"
                            >
                                <DatabaseZap className="w-4 h-4" />
                                {seeding ? "Sembrando..." : "Sembrar registros de prueba (Seed)"}
                            </button>
                        )}
                    </div>
                )}

                {/* Resultados post-entrenamiento */}
                {resultado && (
                    <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase">Entrenamiento Completado</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                            <div className="flex justify-between">
                                <span>Órdenes entrenadas:</span>
                                <span className="font-mono font-bold text-white">{resultado.registros_entrenados}</span>
                            </div>
                            {resultado.mae_actual !== null && (
                                <div className="flex justify-between">
                                    <span>Error MAE anterior:</span>
                                    <span className="font-mono">{resultado.mae_actual.toFixed(3)} hrs</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Error MAE nuevo:</span>
                                <span className="font-mono font-bold text-emerald-400">{resultado.mae_nuevo.toFixed(3)} hrs</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Error MSE nuevo:</span>
                                <span className="font-mono">{resultado.mse_nuevo.toFixed(3)}</span>
                            </div>
                        </div>
                    </div>
                )}


                {/* Botón Exportar Historial */}
                <button
                    onClick={exportarHistorialCompleto}
                    disabled={exportando || uploading}
                    className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-white border border-white/5 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {exportando ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Generando Excel...</>
                    ) : (
                        <><FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar Historial Completo (Excel)</>
                    )}
                </button>

                {/* Info Alerta */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: AppColors.violet }} />
                    <div>
                        <p className="text-xs font-semibold text-white">Calibración con Fiabilidad Total</p>
                        <p className="text-[10px] mt-0.5 text-slate-400">
                            Los datos históricos subidos se asumen como verdad absoluta. Las métricas de error se muestran con fines informativos de diagnóstico para el usuario.
                        </p>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN DE SEGURIDAD */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border" 
                         style={{ background: AppColors.surface, borderColor: AppColors.border }}>
                        
                        <div className="flex items-center gap-3 text-red-400 border-b border-white/5 pb-3">
                            <AlertTriangle className="w-6 h-6 shrink-0 text-red-400" />
                            <h3 className="font-bold text-white text-base">⚠️ Marco de Seguridad y Consecuencias</h3>
                        </div>

                        <div className="mt-4 space-y-3.5 text-xs text-slate-300">
                            <p className="font-semibold text-slate-200">
                                Antes de subir este documento y actualizar la IA, por favor revise las siguientes implicaciones de seguridad:
                            </p>
                            
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <span className="font-mono text-red-400 font-bold shrink-0">1.</span>
                                    <p>
                                        <strong className="text-white font-bold">Sobrescritura de Órdenes:</strong> Para evitar duplicados, cualquier orden existente en la base de datos con el mismo número de orden que las del archivo será <strong className="text-white font-bold">borrada y reemplazada por completo</strong> junto con sus reportes.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-mono text-red-400 font-bold shrink-0">2.</span>
                                    <p>
                                        <strong className="text-white font-bold">Reentrenamiento Directo:</strong> Los nuevos datos se utilizarán de inmediato para recalibrar el modelo híbrido (Regresión Lineal o Random Forest) y sobrescribir el archivo de producción activo (<code className="text-violet-400 font-bold text-[10px] font-mono">random_forest_v1.pkl</code>).
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-mono text-red-400 font-bold shrink-0">3.</span>
                                    <p>
                                        <strong className="text-white font-bold">Calibración Directa:</strong> El modelo se actualizará de forma directa para reflejar los nuevos datos ingresados, sin bloqueos artificiales por degradación.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/5 space-y-2">
                                <label className="text-[10px] text-slate-400 font-semibold uppercase">
                                    Escriba "ENTRENAR" para autorizar esta operación:
                                </label>
                                <input
                                    type="text"
                                    placeholder="ENTRENAR"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-[#0d1018] border text-white focus:border-red-500/50 outline-none"
                                    style={{ borderColor: AppColors.border }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setConfirmText("");
                                }}
                                className="flex-1 h-10 rounded-xl text-xs font-bold bg-[#0d1018] hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    subirYEntrenarExcel();
                                }}
                                disabled={confirmText !== "ENTRENAR"}
                                className="flex-1 h-10 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                Sí, Entrenar IA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function IAPage() {
    const [tabActiva, setTab] = useState<"prediccion" | "cuellos" | "recomendaciones" | "gestion">("prediccion");
    const [proyecciones, setProyecciones] = useState<any[]>([]);
    const [cuellos, setCuellos] = useState<any[]>([]);
    const [recs, setRecs] = useState<any[]>([]);
    const [activeDelays, setActiveDelays] = useState<{ riesgo: string; msg: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [expCuello, setExp] = useState<Record<string, boolean>>({});

    const [mtsCantidad, setMtsCantidad] = useState(150);
    const [simulacionMts, setSimulacionMts] = useState<any[]>([]);
    const [simulando, setSimulando] = useState(false);

    // Estatus de la calibración de la IA
    const [modelStatus, setModelStatus] = useState<any>(null);

    // Estados para la Calculadora de Tiempos
    const [calcPiezas, setCalcPiezas] = useState<number>(300);
    const [calcLineas, setCalcLineas] = useState<number>(1);
    const [calcPrioridad, setCalcPrioridad] = useState<boolean>(false);
    const [calcPrenda, setCalcPrenda] = useState<string>("camiseta");
    const [calcResultado, setCalcResultado] = useState<any>(null);
    const [calcErrorMsg, setCalcErrorMsg] = useState<string | null>(null);
    const [calculando, setCalculando] = useState<boolean>(false);

    // Nuevos estados para predicción multilínea (RF12)
    const [isMultilinea, setIsMultilinea] = useState<boolean>(false);
    const [itemsMultilinea, setItemsMultilinea] = useState<{ tipo_prenda: string; cantidad_piezas: number }[]>([]);
    const [prendaAgregada, setPrendaAgregada] = useState<string>("camiseta");
    const [cantidadAgregada, setCantidadAgregada] = useState<number>(100);

    const agregarPrendaMultilinea = () => {
        if (cantidadAgregada <= 0) return;
        setItemsMultilinea(prev => {
            const index = prev.findIndex(item => item.tipo_prenda === prendaAgregada);
            if (index !== -1) {
                const updated = [...prev];
                updated[index].cantidad_piezas += cantidadAgregada;
                return updated;
            }
            return [...prev, { tipo_prenda: prendaAgregada, cantidad_piezas: cantidadAgregada }];
        });
    };

    const eliminarPrendaMultilinea = (tipoPrenda: string) => {
        setItemsMultilinea(prev => prev.filter(item => item.tipo_prenda !== tipoPrenda));
    };

    const ejecutarCalculadora = async () => {
        setCalculando(true);
        setCalcErrorMsg(null);
        setCalcResultado(null);
        try {
            if (isMultilinea) {
                if (itemsMultilinea.length === 0) {
                    throw new Error("Debe agregar al menos una prenda a la lista de la orden.");
                }
                const data = await predictOrderItemsAction(itemsMultilinea, calcPrioridad, calcLineas);
                setCalcResultado(data);
            } else {
                const data = await predictDeliveryTimeAction(calcPiezas, calcPrioridad, calcLineas, calcPrenda);
                setCalcResultado(data);
            }
        } catch (e: any) {
            setCalcErrorMsg(e.message || "Error al calcular la predicción.");
        } finally {
            setCalculando(false);
        }
    };

    const loadIaData = async () => {
        setLoading(true);
        try {
            const proj = await getProjectionsAction();
            const bnecks = await getBottlenecksAction();
            const status = await getIaStatusAction();
            const delays = await getActiveDelaysAction();

            setProyecciones(proj);
            setCuellos(bnecks.cuellos);
            setRecs(bnecks.recomendaciones);
            setModelStatus(status);
            setActiveDelays(delays);
        } catch (e) {
            console.error("Fallo al consultar microservicio de ML:", e);
        } finally {
            setLoading(false);
        }
    };

    const runSimulation = async (cant: number) => {
        if (!cant || cant <= 0 || isNaN(cant)) {
            setSimulacionMts([]);
            return;
        }
        setSimulando(true);
        try {
            const data = await simulateMtsAction(cant);
            setSimulacionMts(data);
        } catch (e) {
            console.error("Fallo al simular impacto MTS:", e);
        } finally {
            setSimulando(false);
        }
    };

    useEffect(() => {
        loadIaData();
    }, []);

    useEffect(() => {
        if (tabActiva === "prediccion") {
            runSimulation(mtsCantidad);
        }
    }, [mtsCantidad, tabActiva]);

    const aceptarRecomendacion = (id: string) => {
        setRecs(prev => prev.map(r => r.id === id ? { ...r, aceptada: true } : r));
    };

    const rechazarRecomendacion = (id: string) => {
        setRecs(prev => prev.map(r => r.id === id ? { ...r, aceptada: false } : r));
    };

    const criticasCount = cuellos.filter(c => c.nivel === "critica").length;
    const pendRecs = recs.filter(r => r.aceptada === undefined).length;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-[#080b10] min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mr-3" />
                <span className="font-bold">Cargando modelos e inferencias de IA...</span>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-[#080b10]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: AppColors.border, background: AppColors.surface }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${AppColors.violet}20`, border: `1px solid ${AppColors.violet}40` }}>
                            <Brain className="w-5 h-5" style={{ color: AppColors.violet }} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white">IA Predictiva Real</h1>
                            <p className="text-xs mt-0.5 text-slate-400">
                                {modelStatus?.modelo_cargado 
                                    ? `Microservicio ${modelStatus.algoritmo_activo} · Calibrado` 
                                    : "Microservicio Inactivo · Requiere calibración"}
                            </p>
                        </div>
                    </div>
                    {modelStatus?.modelo_cargado ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: AppColors.emerald }} />
                            <span className="text-xs font-semibold text-white">Modelo Calibrado</span>
                            <span className="text-xs font-mono text-slate-400">
                                {modelStatus.mae != null ? `${modelStatus.mae.toFixed(3)}h MAE` : "91.2% MAE Confianza"}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: AppColors.amber }} />
                            <span className="text-xs font-semibold text-white" style={{ color: AppColors.amber }}>IA Inactiva</span>
                            <span className="text-xs font-mono text-slate-500">Sin Calibración</span>
                        </div>
                    )}
                </div>

                {/* KPIs IA */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                        { label: "Registros Calibrados", valor: modelStatus?.modelo_cargado ? `${modelStatus.registros_entrenados} ord` : "0 ord", sub: "Histórico en modelo", color: AppColors.amber },
                        { label: "Rendimiento Planta", valor: "84.2%", sub: "Promedio semanal", color: AppColors.emerald },
                        { label: "Saturaciones Críticas", valor: criticasCount, sub: "en maquinaria", color: AppColors.red },
                        { label: "Recomendaciones Pendientes", valor: pendRecs, sub: "de balanceo", color: AppColors.violet },
                    ].map(k => (
                        <div key={k.label} className="rounded-xl px-4 py-3"
                            style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                            <p className="text-xs mb-1" style={{ color: AppColors.slate }}>{k.label}</p>
                            <p className="text-lg font-black font-mono" style={{ color: k.color }}>{k.valor}</p>
                            <p className="text-xs text-slate-500" style={{ color: AppColors.slate }}>{k.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: AppColors.border, background: AppColors.surface }}>
                {([
                    ["prediccion", "📈 Proyecciones & Simulación", undefined],
                    ["cuellos", "⚡ Cuellos de Botella", criticasCount > 0 ? String(criticasCount) : undefined],
                    ["recomendaciones", "👥 Recomendaciones Personal", pendRecs > 0 ? String(pendRecs) : undefined],
                    ["gestion", "🔧 Gestión Modelo IA", undefined],
                ] as const).map(([id, label, badge]) => (
                    <button key={id} onClick={() => setTab(id as any)}
                        className="flex-1 py-3.5 text-xs font-semibold relative transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ color: tabActiva === id ? AppColors.orange : "#64748b" }}>
                        {label}
                        {badge && (
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-red-500 text-white">{badge}</span>
                        )}
                        {tabActiva === id && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: AppColors.orange }} />}
                    </button>
                ))}
            </div>

            <div className="p-6 space-y-5">

                {/* ── TAB: Proyección ── */}
                {tabActiva === "prediccion" && (
                    <div className="space-y-5">
                        {/* RF12: Calculadora de Tiempos de Entrega */}
                        <div className="rounded-2xl overflow-hidden animate-in fade-in duration-300 border" style={{ background: AppColors.surface, borderColor: AppColors.border }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                                <Brain className="w-5 h-5" style={{ color: AppColors.violet }} />
                                <h3 className="font-bold text-white text-sm">Calculadora de Tiempos de Entrega (RF12)</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Selector de Tipo de Predicción */}
                                <div className="flex gap-2 p-1 rounded-xl bg-[#0d1018] border" style={{ borderColor: AppColors.border }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMultilinea(false);
                                            setCalcResultado(null);
                                            setCalcErrorMsg(null);
                                        }}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                        style={{
                                            background: !isMultilinea ? AppColors.orange : "transparent",
                                            color: !isMultilinea ? "#fff" : AppColors.slate
                                        }}
                                    >
                                        Prenda Individual
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMultilinea(true);
                                            setCalcResultado(null);
                                            setCalcErrorMsg(null);
                                        }}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                        style={{
                                            background: isMultilinea ? AppColors.orange : "transparent",
                                            color: isMultilinea ? "#fff" : AppColors.slate
                                        }}
                                    >
                                        Orden Completa (Multilínea)
                                    </button>
                                </div>

                                {!isMultilinea ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Prenda</label>
                                            <select
                                                value={calcPrenda}
                                                onChange={(e) => setCalcPrenda(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg text-xs bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50 cursor-pointer"
                                            >
                                                <option value="camiseta">Camiseta</option>
                                                <option value="pantalon">Pantalón</option>
                                                <option value="jogger">Jogger</option>
                                                <option value="sudadera">Sudadera</option>
                                                <option value="chaqueta">Chaqueta</option>
                                                <option value="vestido">Vestido</option>
                                                <option value="corbata">Corbata</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Cantidad de piezas</label>
                                            <input
                                                type="number"
                                                value={calcPiezas}
                                                onChange={(e) => setCalcPiezas(Number(e.target.value))}
                                                className="w-full h-10 px-3 rounded-lg text-xs font-mono bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Prenda a agregar</label>
                                                <select
                                                    value={prendaAgregada}
                                                    onChange={(e) => setPrendaAgregada(e.target.value)}
                                                    className="w-full h-10 px-3 rounded-lg text-xs bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50 cursor-pointer"
                                                >
                                                    <option value="camiseta">Camiseta</option>
                                                    <option value="pantalon">Pantalón</option>
                                                    <option value="jogger">Jogger</option>
                                                    <option value="sudadera">Sudadera</option>
                                                    <option value="chaqueta">Chaqueta</option>
                                                    <option value="vestido">Vestido</option>
                                                    <option value="corbata">Corbata</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Cantidad piezas</label>
                                                <input
                                                    type="number"
                                                    value={cantidadAgregada}
                                                    onChange={(e) => setCantidadAgregada(Number(e.target.value))}
                                                    className="w-full h-10 px-3 rounded-lg text-xs font-mono bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={agregarPrendaMultilinea}
                                                className="w-full h-10 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                                style={{
                                                    background: `${AppColors.orange}15`,
                                                    color: AppColors.orange,
                                                    border: `1px solid ${AppColors.orange}35`
                                                }}
                                            >
                                                + Agregar Prenda
                                            </button>
                                        </div>

                                        {/* Lista de prendas agregadas */}
                                        <div className="rounded-xl border bg-[#0d1018]/50 overflow-hidden" style={{ borderColor: AppColors.border }}>
                                            <div className="px-4 py-2 border-b bg-[#0d1018] flex items-center justify-between" style={{ borderColor: AppColors.border }}>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Prendas en la Orden</span>
                                                <span className="text-[10px] text-indigo-400 font-bold font-mono">{itemsMultilinea.length} prendas</span>
                                            </div>
                                            {itemsMultilinea.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-slate-500 italic">No hay prendas agregadas a la orden de simulación.</div>
                                            ) : (
                                                <div className="divide-y divide-[#1e2130] max-h-40 overflow-y-auto custom-scrollbar">
                                                    {itemsMultilinea.map((item) => (
                                                        <div key={item.tipo_prenda} className="flex justify-between items-center px-4 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="w-3.5 h-3.5" style={{ color: AppColors.violet }} />
                                                                <span className="text-xs font-semibold text-white capitalize">{item.tipo_prenda}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-mono font-bold text-slate-300">{item.cantidad_piezas} piezas</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => eliminarPrendaMultilinea(item.tipo_prenda)}
                                                                    className="p-1 rounded text-red-400 bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Líneas de producción</label>
                                        <input
                                            type="number"
                                            value={calcLineas}
                                            onChange={(e) => setCalcLineas(Number(e.target.value))}
                                            className="w-full h-10 px-3 rounded-lg text-xs font-mono bg-[#0d1018] border text-white border-white/5 outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="flex items-center h-full pt-4">
                                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={calcPrioridad}
                                                onChange={(e) => setCalcPrioridad(e.target.checked)}
                                                className="w-4 h-4 rounded bg-[#0d1018] border-white/5 focus:ring-0 cursor-pointer"
                                                style={{ color: AppColors.orange }}
                                            />
                                            <span>Prioridad Alta / Urgente</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={ejecutarCalculadora}
                                    disabled={calculando}
                                    className="w-full h-10 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                                    style={{ background: AppColors.violet }}
                                >
                                    {calculando ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Estimando...</> : <><Zap className="w-3.5 h-3.5" /> Calcular Estimación</>}
                                </button>

                                {/* Alerta de error (Modelo no entrenado) */}
                                {calcErrorMsg && (
                                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Estimación no disponible</p>
                                            <p className="mt-0.5 leading-relaxed">{calcErrorMsg}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Alerta prenda nueva (Unitario) */}
                                {!isMultilinea && calcResultado && calcResultado.prenda_nueva && (
                                    <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200"
                                        style={{ background: `${AppColors.amber}10`, border: `1px solid ${AppColors.amber}25`, color: AppColors.amber }}>
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                                        <div>
                                            <p className="font-bold">Estimación No Disponible (Prenda Nueva)</p>
                                            <p className="mt-0.5 leading-relaxed text-slate-300">
                                                La prenda seleccionada (<strong className="text-white capitalize">{calcPrenda}</strong>) es nueva en planta y no cuenta con registros históricos. Por seguridad y para evitar datos no verídicos, la estimación del tiempo por IA está desactivada. Ingrese el tiempo estimado manualmente o suba datos de producción de esta prenda para calibrar el modelo.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Alerta prenda nueva global (Multilínea) */}
                                {isMultilinea && calcResultado && calcResultado.prenda_nueva_global && (
                                    <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200"
                                        style={{ background: `${AppColors.amber}10`, border: `1px solid ${AppColors.amber}25`, color: AppColors.amber }}>
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                                        <div>
                                            <p className="font-bold">Estimación Global Bloqueada (Prenda Nueva Detectada)</p>
                                            <p className="mt-0.5 leading-relaxed text-slate-300">
                                                Uno o más tipos de prenda en la orden no cuentan con historial de costura previo. Por seguridad, no se puede calcular un tiempo consolidado global confiable. Por favor, revise el desglose por ítem a continuación.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Resultados de cálculo (Unitario) */}
                                {!isMultilinea && calcResultado && !calcResultado.prenda_nueva && calcResultado.tiempo_estimado_horas !== null && (
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase">Estimación Completada ({calcResultado.algoritmo_usado})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-slate-400 block font-semibold mb-0.5">Tiempo estimado:</span>
                                                <span className="text-lg font-black text-white font-mono">{calcResultado.tiempo_estimado_horas} hrs</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-semibold mb-0.5">Margen de error:</span>
                                                <span className="text-lg font-black text-slate-300 font-mono">± {calcResultado.margen_error_horas} hrs</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Resultados de cálculo (Multilínea) */}
                                {isMultilinea && calcResultado && (
                                    <div className="space-y-3 animate-in zoom-in-95 duration-200">
                                        {!calcResultado.prenda_nueva_global && calcResultado.tiempo_estimado_total_horas !== null && (
                                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                                                <div className="flex items-center gap-2 text-emerald-400">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase">Estimación Consolidada Completada</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-400 block font-semibold mb-0.5">Tiempo Total Consolidado:</span>
                                                        <span className="text-lg font-black text-white font-mono">{calcResultado.tiempo_estimado_total_horas} hrs</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block font-semibold mb-0.5">Margen de Error Acumulado:</span>
                                                        <span className="text-lg font-black text-slate-300 font-mono">± {calcResultado.margen_error_total_horas} hrs</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Desglose de cada prenda */}
                                        <div className="rounded-xl border overflow-hidden text-xs bg-[#0d1018]/50" style={{ borderColor: AppColors.border }}>
                                            <div className="px-4 py-2 border-b bg-[#0d1018] text-slate-400 font-bold uppercase" style={{ borderColor: AppColors.border }}>
                                                Desglose de Estimaciones por Ítem
                                            </div>
                                            <div className="divide-y divide-[#1e2130] max-h-48 overflow-y-auto custom-scrollbar">
                                                {calcResultado.detalles?.map((det: any) => (
                                                    <div key={det.tipo_prenda} className="px-4 py-2.5 flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="font-semibold text-white capitalize">{det.tipo_prenda}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold">{det.cantidad_piezas} piezas</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {det.prenda_nueva ? (
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                                                                    style={{
                                                                        color: AppColors.orange,
                                                                        background: `${AppColors.orange}10`,
                                                                        border: `1px solid ${AppColors.orange}30`
                                                                    }}>
                                                                    Prenda Nueva (Sin estimar)
                                                                </span>
                                                            ) : (
                                                                <div>
                                                                    <p className="font-bold text-white font-mono">{det.tiempo_estimado_horas} hrs</p>
                                                                    <p className="text-[9px] text-slate-400 font-mono">± {det.margen_error_horas} hrs</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráfica proyección */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                                <BarChart3 className="w-5 h-5" style={{ color: AppColors.orange }} />
                                <h3 className="font-bold text-white text-sm">Proyección de Producción Diaria (RF13)</h3>
                            </div>
                            <div className="p-5">
                                {proyecciones.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[260px] text-center border-2 border-dashed rounded-xl" style={{ borderColor: AppColors.border }}>
                                        <p className="text-sm font-bold text-slate-300">Esperando datos reales de producción</p>
                                        <p className="text-xs text-slate-500 mt-2 max-w-[300px]">
                                            La IA requiere que al menos un supervisor valide los reportes de avance de los operarios para poder proyectar la tendencia diaria.
                                        </p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <ComposedChart data={proyecciones} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                            <defs>
                                                <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={AppColors.orange} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={AppColors.orange} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={AppColors.violet} stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor={AppColors.violet} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={AppColors.border} vertical={false} />
                                            <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<TooltipIA />} />
                                            <Line type="monotone" dataKey="meta" stroke="#334155" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                                            <Area type="monotone" dataKey="pred" stroke={AppColors.violet} strokeWidth={2} strokeDasharray="4 2" fill="url(#gP2)" dot={false} />
                                            <Area type="monotone" dataKey="real" stroke={AppColors.orange} strokeWidth={2.5} fill="url(#gR2)"
                                                dot={{ fill: AppColors.orange, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: AppColors.orange, stroke: "#fff", strokeWidth: 2 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="px-5 pb-4 flex gap-4 text-xs" style={{ color: "#475569" }}>
                                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block" style={{ background: AppColors.orange }} /> Real</span>
                                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: "#334155" }} /> Meta Diario</span>
                                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: AppColors.violet }} /> Predicción de IA</span>
                            </div>
                        </div>

                        {/* RF14: Detección temprana de retrasos */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                                <AlertTriangle className="w-5 h-5" style={{ color: AppColors.amber }} />
                                <h3 className="font-bold text-white text-sm">Detección Temprana de Retrasos en Cola Activa (RF14)</h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {activeDelays.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <CheckCircle2 className="w-10 h-10 mb-2" style={{ color: AppColors.emerald }} />
                                        <p className="text-sm font-bold text-white">Saludable</p>
                                        <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                                            No se detectan retrasos. Todas las órdenes en cola están avanzando a tiempo.
                                        </p>
                                    </div>
                                ) : (
                                    activeDelays.map((r, i) => {
                                        const color = r.riesgo === "alto" ? AppColors.red : AppColors.amber;
                                        return (
                                            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                                                style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                                                <p className="text-sm text-slate-300" style={{ color: "#cbd5e1" }}>{r.msg}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* RF16: Simulación impacto MTS */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                                <GitCompare className="w-5 h-5" style={{ color: AppColors.sky }} />
                                <h3 className="font-bold text-white text-sm">Simulador de Impacto de Stock MTS en Pedidos MTO (RF16)</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-xs text-slate-400">
                                        Simular la inserción de una orden de stock (MTS) de:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={mtsCantidad}
                                            onChange={(e) => setMtsCantidad(Number(e.target.value))}
                                            className="w-24 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#0d1018] border text-white border-white/5"
                                        />
                                        <span className="text-xs font-semibold text-slate-400">piezas</span>
                                    </div>
                                </div>

                                {simulando ? (
                                    <div className="text-xs text-slate-500 py-4 text-center italic">Calculando impacto en cola...</div>
                                ) : simulacionMts.length === 0 && mtsCantidad > 0 ? (
                                    <div className="text-xs text-slate-500 py-4 text-center">No hay órdenes MTO activas para simular un impacto.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {simulacionMts.map(r => (
                                            <div key={r.orden} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                                style={{ background: "#0d1018", border: `1px solid ${AppColors.border}` }}>
                                                <span className="font-mono text-xs font-bold" style={{ color: AppColors.orange }}>{r.orden}</span>
                                                <span className="text-xs text-slate-400">{r.antes} (Entrega original)</span>
                                                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                                                <span className="text-xs font-bold" style={{ color: r.color }}>{r.despues}</span>
                                                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: `${r.color}10`, color: r.color }}>{r.impacto}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: Cuellos de botella ── */}
                {tabActiva === "cuellos" && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-400">RF15 — Detección en tiempo real de saturación en estaciones de trabajo</p>
                        
                        {cuellos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl" style={{ borderColor: AppColors.border }}>
                                <CheckCircle2 className="w-10 h-10 mb-2" style={{ color: AppColors.emerald }} />
                                <p className="text-sm font-bold text-white">Flujo Saludable / Sin Datos</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                                    Actualmente no hay máquinas registradas en el sistema o no se detectan cuellos de botella en la planta.
                                </p>
                            </div>
                        ) : (
                            cuellos.map(cuello => {
                                const cfg = NIVEL_CFG[cuello.nivel] || NIVEL_CFG.info;
                                const isExp = expCuello[cuello.maquina];
                                return (
                                    <div key={cuello.maquina} className="rounded-xl overflow-hidden"
                                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                        <button onClick={() => setExp(p => ({ ...p, [cuello.maquina]: !p[cuello.maquina] }))}
                                            className="w-full flex items-start gap-3 p-4 text-left cursor-pointer">
                                            <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                                                    <span className="text-xs text-slate-400">· {cuello.maquina}</span>
                                                </div>
                                                <p className="text-sm font-medium mt-1 text-[#cbd5e1]">{cuello.msg}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xl font-black font-mono" style={{ color: cfg.color }}>{cuello.sat}%</span>
                                                <ChevronDown className="w-4 h-4 text-slate-400" style={{ transform: isExp ? "rotate(180deg)" : "none" }} />
                                            </div>
                                        </button>
                                        {isExp && (
                                            <div className="px-4 pb-4 pt-3 space-y-2 border-t" style={{ borderColor: AppColors.border }}>
                                                <div className="h-2 rounded-full" style={{ background: "#1e293b" }}>
                                                    <div className="h-full rounded-full" style={{ width: `${cuello.sat}%`, background: cfg.color }} />
                                                </div>
                                                <p className="text-xs flex items-center gap-2 text-[#94a3b8]">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    Retraso acumulado proyectado: <strong className="text-white">
                                                        {cuello.impacto > 0 ? `${cuello.impacto} hrs` : "Sin impacto"}
                                                    </strong>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ── TAB: Recomendaciones ── */}
                {tabActiva === "recomendaciones" && (
                    <div className="space-y-4">
                        <p className="text-xs text-slate-400">RF15 — Balanceo asistido redistribuyendo operarios calificados hacia estaciones Merrow/Cover</p>
                        
                        {recs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-xl" style={{ borderColor: AppColors.border }}>
                                <CheckCircle2 className="w-10 h-10 mb-2" style={{ color: AppColors.emerald }} />
                                <p className="text-sm font-bold text-white">Sin recomendaciones pendientes</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                                    No hay operarios calificados para balancear, o no se detectaron cuellos de botella que requieran asistencia de la IA.
                                </p>
                            </div>
                        ) : (
                            recs.map(r => {
                            if (r.aceptada !== undefined) return (
                                <div key={r.id} className="rounded-xl border p-4 flex items-center gap-3 opacity-50"
                                    style={{ borderColor: AppColors.border }}>
                                    {r.aceptada
                                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        : <X className="w-5 h-5 text-slate-400" />}
                                    <p className="text-sm text-slate-400">
                                        {r.aceptada ? "Recomendación de balanceo aplicada" : "Recomendación ignorada"}
                                    </p>
                                </div>
                            );
                            return (
                                <div key={r.id} className="rounded-2xl overflow-hidden"
                                    style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
                                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-medium text-slate-400">Rebalanceo de Personal</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                                            style={{
                                                color: r.prioridad === "alta" ? AppColors.red : AppColors.amber,
                                                background: r.prioridad === "alta" ? `${AppColors.red}15` : `${AppColors.amber}15`,
                                                border: `1px solid ${r.prioridad === "alta" ? AppColors.red + "40" : AppColors.amber + "40"}`,
                                            }}>{r.prioridad}</span>
                                    </div>
                                    
                                    {/* Movimiento visual */}
                                    <div className="mx-4 mb-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: "#0d1018" }}>
                                        <div className="flex-1 text-center">
                                            <p className="text-[10px] mb-0.5 text-slate-500 uppercase font-bold">Origen</p>
                                            <p className="text-sm font-bold text-white uppercase">{r.origen}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{ background: `${AppColors.orange}20`, border: `1px solid ${AppColors.orange}40`, color: AppColors.orange }}>
                                                {r.empleado.split(" ").map((n: string) => n[0]).join("")}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-[10px] mb-0.5 text-slate-500 uppercase font-bold">Destino</p>
                                            <p className="text-sm font-bold text-indigo-400 uppercase">{r.destino}</p>
                                        </div>
                                    </div>
                                    <p className="px-4 font-semibold text-sm text-white">{r.empleado}</p>
                                    <p className="px-4 mt-1 text-xs text-slate-300 leading-relaxed">{r.justificacion}</p>
                                    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                        <TrendingUp className="w-4 h-4 shrink-0 text-emerald-400" />
                                        <span className="text-xs text-emerald-400">
                                            Ahorro de ciclo estimado: <strong>{r.ganancia} hrs</strong>
                                        </span>
                                    </div>
                                    <div className="flex gap-2 p-4 pt-3">
                                        <button onClick={() => rechazarRecomendacion(r.id)}
                                            className="flex-1 h-10 rounded-xl border text-xs font-semibold border-white/5 text-slate-400 hover:bg-white/5 cursor-pointer">Ignorar</button>
                                        <button onClick={() => aceptarRecomendacion(r.id)}
                                            className="flex-1 h-10 rounded-xl text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-500 cursor-pointer">Aplicar Movimiento</button>
                                    </div>
                                </div>
                            );
                        })
                        )}
                    </div>
                )}

                {/* ── TAB: Gestión Modelo ── */}
                {tabActiva === "gestion" && <PanelGestionModelo status={modelStatus} onSuccess={loadIaData} />}

            </div>
        </div>
    );
}