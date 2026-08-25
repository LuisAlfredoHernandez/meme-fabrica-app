"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { AppColors } from "@/shared/constants";
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                                Órdenes de Compra
                            </span>
                        </h1>
                        <p className="text-sm font-medium text-slate-400 mt-2">
                            Gestiona pedidos a proveedores y abastecimiento de insumos.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchOrdenesCompra()}
                            disabled={loading}
                            className="p-3 rounded-xl bg-[#1e2130] hover:bg-[#25293d] text-slate-300 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white shadow-lg transition-all hover:shadow-emerald-500/20 hover:scale-105 active:scale-95"
                            style={{ background: `linear-gradient(135deg, ${AppColors.emerald}, #10b981)` }}
                        >
                            <Plus className="w-5 h-5" />
                            Nueva Orden
                        </button>
                    </div>
                </div>

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
