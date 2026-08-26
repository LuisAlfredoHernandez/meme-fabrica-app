"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
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
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#080b10] to-[#13161e] p-6 lg:p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Cabecera */}
                <Header 
                    title="Órdenes de Venta"
                    subtitle="Gestiona las solicitudes de los clientes y transfiérelas a producción."
                    buttonLabel="Nueva Orden"
                    onButtonClick={() => setModalOpen(true)}
                />

                {/* Contenido Principal */}
                <div className="animate-fade-in-up">
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
