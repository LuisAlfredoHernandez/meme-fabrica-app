"use client";

import { Clock, ArrowUpDown, CheckCircle2, AlertTriangle, Trash2, Edit3, Receipt } from "lucide-react";
import { OrdenVenta, EstadoOrdenVenta } from "@/types";
import { AppColors } from "@/shared/constants";
import { useState } from "react";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { formatLocalDate } from "@/utils/formatters";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ModalGestionOrdenVenta } from "./ModalGestionOrdenVenta";
import { useOrdenesVentaStore } from "@/features/ordenes-venta/store/useOrdenesVentaStore";

const ESTADO_CFG: Record<EstadoOrdenVenta, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    EN_ESPERA: { label: "En Espera", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    EN_PRODUCCION: { label: "En Producción", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    COMPLETADA: { label: "Completada", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    FACTURADA: { label: "Facturada", color: "#818cf8", bg: "rgba(129,140,248,0.12)", icon: <Receipt className="w-3.5 h-3.5" /> },
    CANCELADA: { label: "Cancelada", color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const PRIORIDAD_CFG: Record<string, { color: string }> = {
    baja: { color: "#64748b" },
    normal: { color: "#94a3b8" },
    alta: { color: "#fbbf24" },
    urgente: { color: "#f87171" },
};

export function TablaOrdenesVenta({ ordenes }: { ordenes: OrdenVenta[] }) {
    const { deleteOrdenVenta, generarFactura } = useOrdenesVentaStore();
    const [ordenEditando, setOrdenEditando] = useState<OrdenVenta | null>(null);
    const [idParaEliminar, setIdParaEliminar] = useState<string | null>(null);
    const { addToastOnly } = useNotificationActions();

    const handleEliminar = async (id: string) => {
        try {
            await deleteOrdenVenta(id);
            addToastOnly("Orden Eliminada", "La orden de venta fue eliminada.", "success");
        } catch (error: any) {
            addToastOnly("Error", error.message || "No se pudo eliminar la orden.", "error");
        }
    };

    const handleGenerarFactura = async (id: string) => {
        if (!confirm("¿Desea generar la factura para esta orden? Esto cambiará su estado a FACTURADA.")) return;
        try {
            await generarFactura(id);
            addToastOnly("Factura Generada", "La factura se generó con éxito.", "success");
        } catch (error: any) {
            addToastOnly("Error", error.message || "No se pudo generar la factura.", "error");
        }
    };

    return (
        <div className="bg-[#13161e] border border-[#1e2130] rounded-2xl overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#1a1e2b] text-[#94a3b8] font-bold border-b border-[#1e2130]">
                        <tr>
                            <th className="px-5 py-4 whitespace-nowrap">N° Orden</th>
                            <th className="px-5 py-4">Cliente</th>
                            <th className="px-5 py-4">Fecha Entrega</th>
                            <th className="px-5 py-4">Prendas</th>
                            <th className="px-5 py-4">Prioridad</th>
                            <th className="px-5 py-4">Estado</th>
                            <th className="px-5 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2130]">
                        {ordenes.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-[#64748b]">
                                    No hay órdenes de venta registradas.
                                </td>
                            </tr>
                        ) : (
                            ordenes.map((orden) => {
                                const st = ESTADO_CFG[orden.estado] || ESTADO_CFG["EN_ESPERA"];
                                const pr = PRIORIDAD_CFG[orden.prioridad] || PRIORIDAD_CFG["normal"];
                                const totalPrendas = orden.lineas.reduce((acc, l) => acc + l.cantidad, 0);

                                return (
                                    <tr key={orden.id} className="hover:bg-[#1a1e2b] transition-colors group">
                                        <td className="px-5 py-4 font-black text-white whitespace-nowrap">
                                            {orden.numero}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-gray-200">
                                            {orden.cliente}
                                        </td>
                                        <td className="px-5 py-4 text-[#94a3b8] font-medium whitespace-nowrap">
                                            {formatLocalDate(orden.fecha_entrega_estimada)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-300 font-bold">
                                            {totalPrendas} <span className="text-[10px] font-normal text-slate-500 uppercase ml-1">uds</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider" style={{ color: pr.color }}>
                                                {orden.prioridad}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase"
                                                style={{ color: st.color, background: st.bg }}>
                                                {st.icon}
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {orden.estado === "COMPLETADA" && (
                                                    <button onClick={() => handleGenerarFactura(orden.id)}
                                                        className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                                                        title="Generar Factura">
                                                        <Receipt className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => setOrdenEditando(orden)}
                                                    className="p-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                                                    title="Editar">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setIdParaEliminar(orden.id)}
                                                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                    title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
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

            {ordenEditando && (
                <ModalGestionOrdenVenta
                    onClose={() => setOrdenEditando(null)}
                    ordenEditando={ordenEditando}
                />
            )}
            
            {idParaEliminar && (
                <DeleteConfirmModal
                    onCancel={() => setIdParaEliminar(null)}
                    onConfirm={() => handleEliminar(idParaEliminar)}
                    title="Eliminar Orden de Venta"
                    description="¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer."
                />
            )}
        </div>
    );
}
