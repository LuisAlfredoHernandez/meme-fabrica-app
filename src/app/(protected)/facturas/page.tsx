"use client";

import { useEffect } from "react";
import { RefreshCcw, FileText } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { TablaFacturas } from "./componentes/TablaFacturas";
import { useFacturasStore } from "@/features/facturas/store/useFacturasStore";

export default function FacturasPage() {
    const { facturas, fetchFacturas, loading } = useFacturasStore();

    useEffect(() => {
        fetchFacturas();
    }, [fetchFacturas]);

    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#080b10] to-[#13161e] p-6 lg:p-10 custom-scrollbar flex flex-col">
            <div className="max-w-7xl mx-auto space-y-8 flex-1 flex flex-col w-full">
                
                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-600">
                                Facturación
                            </span>
                        </h1>
                        <p className="text-sm font-medium text-slate-400 mt-2">
                            Gestiona las cuentas por cobrar y el historial de pagos de clientes.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchFacturas()}
                            disabled={loading}
                            className="flex items-center gap-2 p-3 rounded-xl bg-[#1e2130] hover:bg-[#25293d] text-slate-300 transition-all active:scale-95 disabled:opacity-50 font-bold text-sm"
                        >
                            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Actualizar</span>
                        </button>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="animate-fade-in-up flex-1 flex flex-col min-h-[500px]">
                    <TablaFacturas facturas={facturas} />
                </div>
            </div>
        </div>
    );
}
