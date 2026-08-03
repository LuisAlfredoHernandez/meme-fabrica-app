import { useState } from "react";
import {
    Brain, Shield, Clock, CheckCircle2,
    Database, FileSpreadsheet, HelpCircle,
    Play, Trash2, AlertCircle, DatabaseZap,
    AlertTriangle, RefreshCw, Bell, Upload
} from "lucide-react";
import { AppColors } from "./IaShared";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import {
    trainModelAction,
    seedDataAction,
    uploadTrainDataAction,
    exportHistoryAction
} from "@/features/ia-predictiva/actions/ia.actions";

interface PanelProps {
    status: any;
    onSuccess: () => void;
}

export function PanelGestionModelo({ status, onSuccess }: PanelProps) {
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
                                            <th className="p-2 whitespace-nowrap">Tarea</th>
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
                                            <td className="p-2 whitespace-nowrap">Corte principal</td>
                                            <td className="p-2 whitespace-nowrap">Juan Pérez</td>
                                            <td className="p-2 whitespace-nowrap">CORTE-01</td>
                                            <td className="p-2 whitespace-nowrap">camiseta</td>
                                            <td className="p-2 whitespace-nowrap font-mono">500</td>
                                            <td className="p-2 whitespace-nowrap font-mono">500</td>
                                            <td className="p-2 whitespace-nowrap font-mono">0</td>
                                            <td className="p-2 whitespace-nowrap font-mono">4.0</td>
                                            <td className="p-2 whitespace-nowrap text-emerald-400 font-bold">validado</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 whitespace-nowrap">2026-03-15</td>
                                            <td className="p-2 whitespace-nowrap font-mono">ORD-2026-001</td>
                                            <td className="p-2 whitespace-nowrap">Nike Inc</td>
                                            <td className="p-2 whitespace-nowrap">MTO</td>
                                            <td className="p-2 whitespace-nowrap">alta</td>
                                            <td className="p-2 whitespace-nowrap">Costura lateral</td>
                                            <td className="p-2 whitespace-nowrap">Ana Gómez</td>
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
                                * Nota: Puedes usar el mismo Número de Orden en múltiples filas si la orden se dividió en diferentes tareas. Se requiere al menos 1 día de registros validados y 2 órdenes.
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
