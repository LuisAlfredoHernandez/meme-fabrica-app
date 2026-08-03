import { useState } from "react";
import { FileSpreadsheet, HelpCircle, Upload, AlertTriangle } from "lucide-react";
import { AppColors } from "../IaShared";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { uploadTrainDataAction } from "@/features/ia-predictiva/actions/ia.actions";

interface ImportacionHistorialProps {
    onSuccess: (result: any) => void;
    onError: (msg: string) => void;
    onUploadStart: () => void;
    onUploadEnd: () => void;
    uploading: boolean;
}

export function ImportacionHistorial({ onSuccess, onError, onUploadStart, onUploadEnd, uploading }: ImportacionHistorialProps) {
    const [file, setFile] = useState<File | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [showExcelFormat, setShowExcelFormat] = useState(false);
    const { addToastOnly } = useNotificationActions();

    const subirYEntrenarExcel = async () => {
        if (!file) return;
        onUploadStart();
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const data = await uploadTrainDataAction(formData);
            setFile(null);
            setConfirmText("");
            addToastOnly("Carga y Entrenamiento Exitoso", "Los datos históricos fueron importados y la IA ha sido recalibrada.", "success");
            onSuccess(data);
        } catch (e: any) {
            addToastOnly("Error de Carga", e.message || "Error al subir o entrenar el modelo.", "error");
            onError(e.message || "Fallo al importar el archivo Excel o entrenar el modelo.");
        } finally {
            onUploadEnd();
        }
    };

    return (
        <>
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
                                        <td className="p-2 whitespace-nowrap">1500</td>
                                        <td className="p-2 whitespace-nowrap">1500</td>
                                        <td className="p-2 whitespace-nowrap">0</td>
                                        <td className="p-2 whitespace-nowrap">4.5</td>
                                        <td className="p-2 whitespace-nowrap">completada</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 whitespace-nowrap">2026-03-15</td>
                                        <td className="p-2 whitespace-nowrap font-mono">ORD-2026-001</td>
                                        <td className="p-2 whitespace-nowrap">Nike Inc</td>
                                        <td className="p-2 whitespace-nowrap">MTO</td>
                                        <td className="p-2 whitespace-nowrap">alta</td>
                                        <td className="p-2 whitespace-nowrap">Costura lateral</td>
                                        <td className="p-2 whitespace-nowrap">Maria Gomez</td>
                                        <td className="p-2 whitespace-nowrap">RECTA-02</td>
                                        <td className="p-2 whitespace-nowrap">camiseta</td>
                                        <td className="p-2 whitespace-nowrap">1500</td>
                                        <td className="p-2 whitespace-nowrap">1490</td>
                                        <td className="p-2 whitespace-nowrap">10</td>
                                        <td className="p-2 whitespace-nowrap">12.0</td>
                                        <td className="p-2 whitespace-nowrap">completada</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="flex-1 text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer file:transition-colors bg-[#080b10] border border-white/5 rounded-xl cursor-pointer"
                    />
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={!file || uploading}
                        className="px-5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                        style={{ background: !file ? AppColors.slate : AppColors.violet }}
                    >
                        {uploading ? "Subiendo..." : <><Upload className="w-4 h-4" /> Importar y Entrenar</>}
                    </button>
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
        </>
    );
}
