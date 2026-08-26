"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { AppColors } from "@/shared/constants";
import { Header } from "@/components/Header";
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
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#080b10] to-[#13161e] p-6 lg:p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Cabecera */}
                <Header 
                    title="Órdenes de Compra"
                    subtitle="Gestiona pedidos a proveedores y abastecimiento de insumos."
                    buttonLabel="Nueva Orden"
                    onButtonClick={() => setModalOpen(true)}
                />

                {/* Contenido Principal */}
                <div className="animate-fade-in-up">
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
