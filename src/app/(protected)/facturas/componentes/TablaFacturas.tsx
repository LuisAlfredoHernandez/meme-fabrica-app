"use client";

import { Clock, CheckCircle2, Receipt, Search } from "lucide-react";
import { FacturaDetalle, EstadoFactura } from "@/types";
import { useFacturasStore } from "@/features/facturas/store/useFacturasStore";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { formatLocalDate } from "@/utils/formatters";
import { useState } from "react";
import { ModalFacturaImprimible } from "./ModalFacturaImprimible";

const ESTADO_CFG: Record<EstadoFactura, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    PENDIENTE: { label: "Pendiente", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    PROCESADA: { label: "Procesada", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

import { AppColors } from "@/shared/constants";

export function TablaFacturas({ facturas }: { facturas: FacturaDetalle[] }) {
    const { procesarFactura } = useFacturasStore();
    const { addToastOnly } = useNotificationActions();
    const [searchTerm, setSearchTerm] = useState("");
    const [facturaAImprimir, setFacturaAImprimir] = useState<FacturaDetalle | null>(null);

    const handleProcesar = async (id: string) => {
        if (!confirm("¿Desea marcar esta factura como PROCESADA? Confirma que el pago ha sido recibido o validado.")) return;
        try {
            await procesarFactura(id);
            addToastOnly("Factura Procesada", "La factura ha sido marcada como procesada exitosamente.", "success");
        } catch (error: any) {
            addToastOnly("Error", error.message || "No se pudo procesar la factura.", "error");
        }
    };

    const facturasFiltradas = facturas.filter(f => 
        f.numero.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.orden_venta?.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.orden_venta?.numero?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="rounded-2xl overflow-hidden flex flex-col h-full" style={{ border: `1px solid ${AppColors.border}`, background: AppColors.bg }}>
            <div className="p-4 border-b" style={{ borderColor: AppColors.border }}>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o número..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white focus:outline-none transition-colors"
                        style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}
                    />
                </div>
            </div>

            <div className="overflow-auto custom-scrollbar flex-1 max-h-[550px]">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 z-10 font-bold border-b" style={{ background: AppColors.surface, color: AppColors.slate, borderColor: AppColors.border }}>
                        <tr>
                            <th className="px-5 py-4 whitespace-nowrap">N° Factura</th>
                            <th className="px-5 py-4">Orden de Venta</th>
                            <th className="px-5 py-4">Cliente</th>
                            <th className="px-5 py-4">Fecha Emisión</th>
                            <th className="px-5 py-4 text-right">Total</th>
                            <th className="px-5 py-4 text-center">Estado</th>
                            <th className="px-5 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facturasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-[#64748b]">
                                    No se encontraron facturas.
                                </td>
                            </tr>
                        ) : (
                            facturasFiltradas.map((factura, index) => {
                                const st = ESTADO_CFG[factura.estado] || ESTADO_CFG["PENDIENTE"];
                                const ov = factura.orden_venta;

                                return (
                                    <tr key={factura.id} className="border-t transition-colors hover:opacity-90 group"
                                        style={{ borderColor: AppColors.border, background: index % 2 === 0 ? AppColors.bg : `${AppColors.surface}80` }}>
                                        <td className="px-5 py-4 font-black text-white whitespace-nowrap">
                                            {factura.numero}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-gray-300">
                                            {ov?.numero || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-gray-200">
                                            {ov?.cliente || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 text-[#94a3b8] font-medium whitespace-nowrap">
                                            {formatLocalDate(factura.fecha_emision)}
                                        </td>
                                        <td className="px-5 py-4 font-black text-emerald-400 text-right whitespace-nowrap">
                                            ${factura.total.toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase"
                                                style={{ color: st.color, background: st.bg }}>
                                                {st.icon}
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {factura.estado === "PENDIENTE" && (
                                                    <button onClick={() => handleProcesar(factura.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-xs font-bold shadow-lg shadow-indigo-500/20"
                                                        title="Marcar como Procesada">
                                                        Procesar Pago
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setFacturaAImprimir(factura)}
                                                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                                                    title="Imprimir">
                                                    <Receipt className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {facturaAImprimir && (
                <ModalFacturaImprimible 
                    factura={facturaAImprimir} 
                    onClose={() => setFacturaAImprimir(null)} 
                />
            )}
        </div>
    );
}
