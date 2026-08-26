"use client";

import { Clock, CheckCircle2, AlertTriangle, Trash2, Edit3, PackageCheck, Eye } from "lucide-react";
import { OrdenCompra, EstadoOrdenCompra } from "@/types";
import { useState } from "react";
import { useNotificationActions } from "@/shared/store/useNotificationStore";
import { formatLocalDate } from "@/utils/formatters";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ModalGestionOrdenCompra } from "./ModalGestionOrdenCompra";
import { useOrdenesCompraStore } from "@/features/ordenes-compra/store/useOrdenesCompraStore";

const ESTADO_CFG: Record<EstadoOrdenCompra, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    PENDIENTE: { label: "Pendiente", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: <Clock className="w-3.5 h-3.5" /> },
    RECIBIDA: { label: "Recibida", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    CANCELADA: { label: "Cancelada", color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

import { AppColors } from "@/shared/constants";

export function TablaOrdenesCompra({ ordenes }: { ordenes: OrdenCompra[] }) {
    const { deleteOrdenCompra, recibirOrdenCompra } = useOrdenesCompraStore();
    const [ordenEditando, setOrdenEditando] = useState<OrdenCompra | null>(null);
    const [modalReadOnly, setModalReadOnly] = useState(false);
    const [idParaEliminar, setIdParaEliminar] = useState<string | null>(null);
    const { addToastOnly } = useNotificationActions();

    const handleEliminar = async (id: string) => {
        try {
            await deleteOrdenCompra(id);
            addToastOnly("Orden Eliminada", "La orden de compra fue eliminada.", "success");
        } catch (error: any) {
            addToastOnly("Error", error.message || "No se pudo eliminar la orden.", "error");
        }
    };

    const handleRecibir = async (id: string) => {
        if (!confirm("¿Desea marcar esta orden como RECIBIDA? Esto incrementará el stock de los insumos.")) return;
        try {
            await recibirOrdenCompra(id);
            addToastOnly("Orden Recibida", "El stock de los insumos ha sido actualizado.", "success");
        } catch (error: any) {
            addToastOnly("Error", error.message || "No se pudo recibir la orden.", "error");
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden flex flex-col h-full" style={{ border: `1px solid ${AppColors.border}`, background: AppColors.bg }}>
            <div className="overflow-auto custom-scrollbar flex-1 max-h-[550px]">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 z-10 font-bold border-b" style={{ background: AppColors.surface, color: AppColors.slate, borderColor: AppColors.border }}>
                        <tr>
                            <th className="px-5 py-4 whitespace-nowrap">N° Orden</th>
                            <th className="px-5 py-4">Proveedor</th>
                            <th className="px-5 py-4">Fecha Creación</th>
                            <th className="px-5 py-4">Líneas</th>
                            <th className="px-5 py-4">Estado</th>
                            <th className="px-5 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-[#64748b]">
                                    No hay órdenes de compra registradas.
                                </td>
                            </tr>
                        ) : (
                            ordenes.map((orden, index) => {
                                const st = ESTADO_CFG[orden.estado] || ESTADO_CFG["PENDIENTE"];
                                const totalInsumos = orden.lineas.reduce((acc, l) => acc + l.cantidad, 0);

                                return (
                                    <tr key={orden.id} className="border-t transition-colors hover:opacity-90 group"
                                        style={{ borderColor: AppColors.border, background: index % 2 === 0 ? AppColors.bg : `${AppColors.surface}80` }}>
                                        <td className="px-5 py-4 font-black text-white whitespace-nowrap">
                                            {orden.numero}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-gray-200">
                                            {orden.proveedor}
                                        </td>
                                        <td className="px-5 py-4 text-[#94a3b8] font-medium whitespace-nowrap">
                                            {formatLocalDate(orden.fecha_creacion)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-300 font-bold">
                                            {totalInsumos} <span className="text-[10px] font-normal text-slate-500 uppercase ml-1">uds</span>
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
                                                {orden.estado === "PENDIENTE" ? (
                                                    <>
                                                        <button onClick={() => handleRecibir(orden.id)}
                                                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                            title="Marcar Recibida">
                                                            <PackageCheck className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => { setModalReadOnly(false); setOrdenEditando(orden); }}
                                                            className="p-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                                                            title="Editar">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setIdParaEliminar(orden.id)}
                                                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                            title="Eliminar">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => { setModalReadOnly(true); setOrdenEditando(orden); }}
                                                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                        title="Ver Detalles">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
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
                <ModalGestionOrdenCompra
                    onClose={() => { setOrdenEditando(null); setModalReadOnly(false); }}
                    ordenEditando={ordenEditando}
                    readOnly={modalReadOnly}
                />
            )}

            {idParaEliminar && (
                <DeleteConfirmModal
                    onCancel={() => setIdParaEliminar(null)}
                    onConfirm={() => handleEliminar(idParaEliminar)}
                    title="Eliminar Orden de Compra"
                    description="¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer."
                />
            )}
        </div>
    );
}
