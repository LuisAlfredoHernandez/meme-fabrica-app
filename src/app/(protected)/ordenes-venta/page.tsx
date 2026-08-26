"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { TablaOrdenesVenta } from "./componentes/TablaOrdenesVenta";
import { ModalGestionOrdenVenta } from "./componentes/ModalGestionOrdenVenta";
import { useOrdenesVentaStore } from "@/features/ordenes-venta/store/useOrdenesVentaStore";

export default function OrdenesVentaPage() {
    const { ordenesVenta, fetchOrdenesVenta, loading } = useOrdenesVentaStore();
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchOrdenesVenta();
    }, [fetchOrdenesVenta]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 text-white max-h-screen custom-scrollbar" style={{ background: AppColors.bg }}>
            <div className="space-y-5">
                
                {/* Cabecera */}
                <Header 
                    title="Órdenes de Venta"
                    subtitle="Gestiona las solicitudes de los clientes y transfiérelas a producción."
                    buttonLabel="Nueva Orden"
                    onButtonClick={() => setModalOpen(true)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Órdenes" valor={ordenesVenta.length} labelColor={AppColors.orange} />
                    <StatCard label="En Espera" valor={ordenesVenta.filter(o => o.estado === "EN_ESPERA").length} labelColor="#94a3b8" />
                    <StatCard label="En Producción" valor={ordenesVenta.filter(o => o.estado === "EN_PRODUCCION").length} labelColor="#fbbf24" />
                    <StatCard label="Completadas" valor={ordenesVenta.filter(o => o.estado === "COMPLETADA" || o.estado === "FACTURADA").length} labelColor={AppColors.emerald} />
                </div>

                {/* Contenido Principal */}
                <div>
                    <TablaOrdenesVenta ordenes={ordenesVenta} />
                </div>
            </div>

            {/* Modal de Creación */}
            {modalOpen && (
                <ModalGestionOrdenVenta onClose={() => setModalOpen(false)} />
            )}
        </div>
    );
}
