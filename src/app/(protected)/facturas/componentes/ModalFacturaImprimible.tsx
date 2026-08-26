"use client";

import { FacturaDetalle } from "@/types";
import { X, Printer } from "lucide-react";
import { formatLocalDate } from "@/utils/formatters";

interface ModalFacturaImprimibleProps {
    factura: FacturaDetalle;
    onClose: () => void;
}

export function ModalFacturaImprimible({ factura, onClose }: ModalFacturaImprimibleProps) {
    const isPendiente = factura.estado === "PENDIENTE";
    const tituloDocumento = isPendiente ? "PRE-FACTURA (PENDIENTE DE PAGO)" : "FACTURA OFICIAL";

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style type="text/css" media="print">
                {`
                    @page {
                        margin: 0;
                    }
                    body {
                        margin: 1cm;
                    }
                `}
            </style>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0 print:backdrop-blur-none">
                {/* Contenedor del Modal: visible normal, y ocupa toda la pagina al imprimir */}
                <div className="w-full max-w-2xl bg-white text-black rounded-2xl shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:rounded-none">

                    {/* Header solo visible en pantalla */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
                        <h2 className="text-lg font-bold text-gray-800">Vista de Impresión</h2>
                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                <Printer className="w-4 h-4" />
                                Imprimir
                            </button>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Cuerpo de la Factura (Visible en pantalla y al imprimir) */}
                    <div className="p-8 bg-white print:p-4 relative overflow-hidden">
                        {/* Marca de agua si está procesada */}
                        {!isPendiente && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none print:opacity-[0.15]">
                                <div className="border-[12px] border-emerald-600 text-emerald-600 text-7xl font-black p-6 rounded-2xl uppercase tracking-widest whitespace-nowrap">
                                    PAGADO
                                </div>
                                {factura.fecha_procesamiento && (
                                    <div className="text-center text-emerald-600 font-black text-2xl mt-4">
                                        {formatLocalDate(factura.fecha_procesamiento)}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6 relative z-10">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 mb-1">{tituloDocumento}</h1>
                                <p className="text-gray-600 font-medium">MEME FÁBRICA S.A.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-bold mb-1">N° FACTURA</p>
                                <p className="text-lg font-black text-gray-900">{factura.numero}</p>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 font-bold">FECHA DE EMISIÓN</p>
                                    <p className="text-gray-900">{formatLocalDate(factura.fecha_emision)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">CLIENTE</p>
                                <p className="text-lg font-bold text-gray-900">{factura.orden_venta?.cliente || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">ORDEN DE VENTA ASOCIADA</p>
                                <p className="text-lg font-bold text-gray-900">{factura.orden_venta?.numero || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden print:border-none">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Descripción</th>
                                        <th className="px-4 py-3 font-bold">Talla</th>
                                        <th className="px-4 py-3 font-bold text-right">Cant.</th>
                                        <th className="px-4 py-3 font-bold text-right">Precio Unit.</th>
                                        <th className="px-4 py-3 font-bold text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {factura.orden_venta?.lineas?.map((linea, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-gray-900">{linea.descripcion}</td>
                                            <td className="px-4 py-3 text-gray-900">{linea.talla}</td>
                                            <td className="px-4 py-3 text-right text-gray-900">{linea.cantidad}</td>
                                            <td className="px-4 py-3 text-right text-gray-900">${linea.precio_unitario.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-bold">${(linea.cantidad * linea.precio_unitario).toFixed(2)}</td>
                                        </tr>
                                    )) || (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No hay líneas asociadas</td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900">${factura.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Impuesto - ITBIS (18%)</span>
                                    <span className="font-bold text-gray-900">${factura.impuesto.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-900">
                                    <span className="font-black text-gray-900 text-lg">TOTAL</span>
                                    <span className="font-black text-indigo-600 text-xl">${factura.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {factura.notas && (
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg print:bg-transparent print:border print:border-gray-200">
                                <p className="text-sm font-bold text-gray-500 mb-1">NOTAS</p>
                                <p className="text-gray-800 text-sm">{factura.notas}</p>
                            </div>
                        )}

                        <div className="mt-12 text-center text-xs text-gray-400 print:block">
                            <p>Documento generado por Meme Fábrica App</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
