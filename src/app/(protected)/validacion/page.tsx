"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useValidacionStore, useValidacionActions } from "@/features/validacion/store/useValidacionStore";
import { useMaquinasStore, useMaquinasActions } from "@/features/maquinas/store/useMaquinasStore";
import { ClipboardCheck, ShieldCheck, AlertCircle, Wrench } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { CertificacionProduccion } from "@/features/validacion/components/CertificacionProduccion";
import { GestionAverias } from "@/features/validacion/components/GestionAverias";

type ActiveTab = "produccion" | "averias";

export default function ValidacionPage() {
    const { user } = useAuthStore();
    const { pendientes } = useValidacionStore();
    const { fetchPendientes } = useValidacionActions();

    const { reportesAveriaPendientes } = useMaquinasStore();
    const { fetchReportesAveriaPendientes, fetchMaquinas } = useMaquinasActions();

    const [activeTab, setActiveTab] = useState<ActiveTab>("produccion");

    useEffect(() => {
        fetchPendientes();
        fetchReportesAveriaPendientes();
        fetchMaquinas();
    }, [fetchPendientes, fetchReportesAveriaPendientes, fetchMaquinas]);

    // Si no es admin ni subjefe, denegar acceso
    if (user?.rol === "operario") {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Acceso Denegado</h1>
                <p>No tienes permisos para ver esta página.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 overflow-y-auto max-h-screen custom-scrollbar">
            {/* Header y Selector de Pestañas */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[#818cf8]" />
                        <h1 className="text-3xl font-black text-white tracking-tight">Validación & Control de Calidad</h1>
                    </div>
                    <p className="text-slate-400 font-medium mt-2">Certificación de producción y gestión de averías en maquinaria.</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-[#13161e] border border-[#1e2130] p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab("produccion")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "produccion"
                            ? "bg-[#818cf8] text-white shadow-lg shadow-[#818cf8]/20"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <ClipboardCheck className="w-4 h-4" />
                        Producción ({pendientes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("averias")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${activeTab === "averias"
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <Wrench className="w-4 h-4" />
                        Averías Máquinas ({reportesAveriaPendientes?.length ?? 0})
                        {reportesAveriaPendientes?.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute top-1.5 right-1.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Métrica Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Avances de Producción Pendientes"
                    valor={pendientes.length}
                    icon={ClipboardCheck}
                    color="#818cf8"
                    labelColor="#818cf8"
                />
                <StatCard
                    label="Máquinas Bajo Revisión"
                    valor={reportesAveriaPendientes?.length ?? 0}
                    icon={Wrench}
                    color="#fbbf24"
                    labelColor="#fbbf24"
                />
            </div>

            {/* VISTAS */}
            {activeTab === "produccion" && <CertificacionProduccion />}
            {activeTab === "averias" && <GestionAverias />}
        </div>
    );
}