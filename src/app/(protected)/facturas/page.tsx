"use client";

import { useEffect } from "react";
import { RefreshCcw, FileText } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
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
                <Header 
                    title="Facturación"
                    subtitle="Gestiona las cuentas por cobrar y el historial de pagos de clientes."
                />

                {/* Contenido Principal */}
                <div className="animate-fade-in-up flex-1 flex flex-col min-h-[500px]">
                    <TablaFacturas facturas={facturas} />
                </div>
            </div>
        </div>
    );
}
