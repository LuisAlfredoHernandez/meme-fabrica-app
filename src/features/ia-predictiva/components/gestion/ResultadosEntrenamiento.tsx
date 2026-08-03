import { useState } from "react";
import { 
    AlertCircle, DatabaseZap, CheckCircle2, 
    RefreshCw, FileSpreadsheet, Bell 
} from "lucide-react";
import { AppColors } from "../IaShared";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { seedDataAction, exportHistoryAction } from "@/features/ia-predictiva/actions/ia.actions";

interface ResultadosEntrenamientoProps {
    resultado: any;
    errorMsg: string | null;
    disableExport: boolean;
    onSuccess: () => void;
    onError: (msg: string) => void;
}

export function ResultadosEntrenamiento({ resultado, errorMsg, disableExport, onSuccess, onError }: ResultadosEntrenamientoProps) {
    const [seeding, setSeeding] = useState(false);
    const [exportando, setExportando] = useState(false);
    const { addToastOnly } = useNotificationActions();

    const sembrarDatos = async () => {
        setSeeding(true);
        try {
            const data = await seedDataAction();
            addToastOnly("Datos Sembrados", data.mensaje || "Datos históricos sembrados correctamente.", "success");
            onSuccess();
        } catch (e: any) {
            onError(e.message || "Error al sembrar datos.");
        } finally {
            setSeeding(false);
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

    return (
        <>
            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 font-bold mb-1">
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

            <button
                onClick={exportarHistorialCompleto}
                disabled={exportando || disableExport}
                className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-white border border-white/5 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
                {exportando ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Generando Excel...</>
                ) : (
                    <><FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar Historial Completo (Excel)</>
                )}
            </button>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: AppColors.violet }} />
                <div>
                    <p className="text-xs font-semibold text-white">Calibración con Fiabilidad Total</p>
                    <p className="text-[10px] mt-0.5 text-slate-400">
                        Los datos históricos subidos se asumen como verdad absoluta. Las métricas de error se muestran con fines informativos de diagnóstico para el usuario.
                    </p>
                </div>
            </div>
        </>
    );
}
