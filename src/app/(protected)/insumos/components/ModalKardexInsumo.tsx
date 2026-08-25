"use client";

import { X, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import type { Insumo, MovimientoInventario } from "@/types";
import { AppColors } from "@/shared/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ModalKardexInsumoProps {
  insumo: Insumo;
  onClose: () => void;
}

export function ModalKardexInsumo({ insumo, onClose }: ModalKardexInsumoProps) {
  const renderIconoMovimiento = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA":
        return (
          <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        );
      case "SALIDA":
        return (
          <div className="p-2 rounded-full bg-orange-500/10 text-orange-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        );
      case "AJUSTE":
      default:
        return (
          <div className="p-2 rounded-full bg-slate-500/10 text-slate-400">
            <RefreshCcw className="w-4 h-4" />
          </div>
        );
    }
  };

  const getSignoMovimiento = (mov: MovimientoInventario) => {
    if (mov.cantidad > 0) return `+${mov.cantidad}`;
    return mov.cantidad.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0d1018] border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]" style={{ borderColor: AppColors.border }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2130]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Kardex: {insumo.nombre}
            </h2>
            <p className="text-sm text-slate-400 font-mono mt-1">
              Código: {insumo.codigo || 'N/A'} | Stock Actual: <span className="text-orange-400 font-bold">{insumo.stock} {insumo.unidad}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable list of movements) */}
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
          {(!insumo.movimientos || insumo.movimientos.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <RefreshCcw className="w-8 h-8 mb-3 opacity-20" />
              <p>No hay movimientos registrados para este insumo.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#13161e] z-10 border-b border-[#1e2130]">
                <tr>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Fecha</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Tipo</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Justificación / Referencia</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {insumo.movimientos.map((mov) => (
                  <tr key={mov.id} className="border-b border-[#1e2130] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="text-sm text-slate-300">
                        {format(new Date(mov.fecha), "dd MMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {renderIconoMovimiento(mov.tipo_movimiento)}
                        <span className="text-xs font-bold text-slate-300">{mov.tipo_movimiento}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{mov.justificacion || "-"}</span>
                        {mov.referencia && (
                          <span className="text-xs font-mono text-orange-400/80 mt-0.5">Ref: {mov.referencia}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-bold ${
                        mov.cantidad > 0 ? "text-emerald-400" : mov.cantidad < 0 ? "text-orange-400" : "text-slate-300"
                      }`}>
                        {getSignoMovimiento(mov)} {insumo.unidad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
