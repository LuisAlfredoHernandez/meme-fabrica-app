"use client";

import { useEffect } from "react";
import { RefreshCcw, FileText } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { TablaFacturas } from "./componentes/TablaFacturas";
import { useFacturasStore } from "@/features/facturas/store/useFacturasStore";

export default function FacturasPage() {
    const { facturas, fetchFacturas, loading } = useFacturasStore();

    useEffect(() => {
        fetchFacturas();
    }, [fetchFacturas]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 text-white max-h-screen custom-scrollbar flex flex-col" style={{ background: AppColors.bg }}>
            <div className="space-y-5 flex-1 flex flex-col w-full">
                
                {/* Cabecera */}
                <Header 
                    title="Facturación"
                    subtitle="Gestiona las cuentas por cobrar y el historial de pagos de clientes."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Facturas" valor={facturas.length} labelColor={AppColors.indigo} />
                    <StatCard label="Pendientes" valor={facturas.filter(f => f.estado === "PENDIENTE").length} labelColor="#fbbf24" />
                    <StatCard label="Pagadas" valor={facturas.filter(f => f.estado === "PAGADA").length} labelColor={AppColors.emerald} />
                    <StatCard label="Atrasadas" valor={facturas.filter(f => f.estado === "ATRASADA").length} labelColor={AppColors.red} />
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 flex flex-col min-h-[500px]">
                    <TablaFacturas facturas={facturas} />
                </div>
            </div>
        </div>
    );
}
