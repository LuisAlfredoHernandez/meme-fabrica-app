import { useState } from "react";
import { Database } from "lucide-react";
import { AppColors } from "./IaShared";
import { MetricasModelo } from "./gestion/MetricasModelo";
import { ImportacionHistorial } from "./gestion/ImportacionHistorial";
import { ResultadosEntrenamiento } from "./gestion/ResultadosEntrenamiento";

interface PanelProps {
    status: any;
    onSuccess: () => void;
}

export function PanelGestionModelo({ status, onSuccess }: PanelProps) {
    const [resultado, setResultado] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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
                <MetricasModelo status={status} />

                {/* Importación de Excel Histórico */}
                <ImportacionHistorial 
                    onSuccess={(res) => {
                        setResultado(res);
                        setErrorMsg(null);
                        onSuccess();
                    }}
                    onError={(msg) => {
                        setErrorMsg(msg);
                        setResultado(null);
                    }}
                    onUploadStart={() => setUploading(true)}
                    onUploadEnd={() => setUploading(false)}
                    uploading={uploading}
                />

                {/* Resultados post-entrenamiento, errores y exportación */}
                <ResultadosEntrenamiento 
                    resultado={resultado}
                    errorMsg={errorMsg}
                    disableExport={uploading}
                    onSuccess={onSuccess}
                    onError={setErrorMsg}
                />
            </div>
        </div>
    );
}
