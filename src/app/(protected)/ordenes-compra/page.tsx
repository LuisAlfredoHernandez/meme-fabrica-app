"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { TablaOrdenesCompra } from "./componentes/TablaOrdenesCompra";
import { ModalGestionOrdenCompra } from "./componentes/ModalGestionOrdenCompra";
import { useOrdenesCompraStore } from "@/features/ordenes-compra/store/useOrdenesCompraStore";

export default function OrdenesCompraPage() {
    const { ordenesCompra, fetchOrdenesCompra, loading } = useOrdenesCompraStore();
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchOrdenesCompra();
    }, [fetchOrdenesCompra]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 text-white max-h-screen custom-scrollbar" style={{ background: AppColors.bg }}>
            <div className="space-y-5">

                {/* Cabecera */}
                <Header
                    title="Órdenes de Compra"
                    subtitle="Gestiona pedidos a proveedores y abastecimiento de insumos."
                    buttonLabel="Nueva Orden"
                    onButtonClick={() => setModalOpen(true)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Órdenes" valor={ordenesCompra.length} labelColor={AppColors.orange} />
                    <StatCard label="Pendientes" valor={ordenesCompra.filter(o => o.estado === "PENDIENTE").length} labelColor="#fbbf24" />
                    <StatCard label="Recibidas" valor={ordenesCompra.filter(o => o.estado === "RECIBIDA").length} labelColor={AppColors.emerald} />
                    <StatCard label="Canceladas" valor={ordenesCompra.filter(o => o.estado === "CANCELADA").length} labelColor={AppColors.red} />
                </div>

                {/* Contenido Principal */}
                <div>
                    <TablaOrdenesCompra ordenes={ordenesCompra} />
                </div>
            </div>

            {/* Modal de Creación */}
            {modalOpen && (
                <ModalGestionOrdenCompra onClose={() => setModalOpen(false)} />
            )}
        </div>
    );
}
