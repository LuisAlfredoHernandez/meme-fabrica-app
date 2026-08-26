"use client";

import { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ajusteInsumoSchema, AjusteInsumoFormData } from "@/features/insumos/schemas/insumos.schemas";
import { useInsumosActions } from "@/features/insumos/store/useInsumosStore";
import type { Insumo } from "@/types";
import { AppColors } from "@/shared/constants";

interface ModalAjusteInsumoProps {
  insumo: Insumo;
  onClose: () => void;
}

export function ModalAjusteInsumo({ insumo, onClose }: ModalAjusteInsumoProps) {
  const { ajusteInsumo } = useInsumosActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AjusteInsumoFormData>({
    resolver: zodResolver(ajusteInsumoSchema),
    defaultValues: {
      cantidad_ajuste: 0,
      justificacion: "",
    },
  });

  const onSubmit = async (data: AjusteInsumoFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await ajusteInsumo(insumo.id, data);
      onClose();
    } catch (e: any) {
      setServerError(e.message || "Error al aplicar el ajuste");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1018] border rounded-2xl shadow-2xl flex flex-col" style={{ borderColor: AppColors.border }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2130]">
          <h2 className="text-lg font-bold text-white">Ajuste de Stock: {insumo.nombre}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <p className="text-sm text-orange-200">
              <strong>Stock Actual:</strong> {insumo.stock} {insumo.unidad}
            </p>
            <p className="text-xs text-orange-300 mt-1">
              Ingrese un valor negativo para reportar mermas, pérdidas o daños de inventario.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-300">Cantidad (Ej. -5)</label>
              <input
                type="number"
                max="-1"
                step="0.01"
                {...register("cantidad_ajuste", { valueAsNumber: true })}
                className="w-full h-10 px-3 bg-[#13161e] border border-[#1e2130] rounded-xl text-white focus:outline-none focus:border-orange-500/50"
              />
              {errors.cantidad_ajuste && <p className="mt-1 text-xs text-red-400">{errors.cantidad_ajuste.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-300">Justificación</label>
              <textarea
                {...register("justificacion")}
                className="w-full h-24 p-3 bg-[#13161e] border border-[#1e2130] rounded-xl text-white focus:outline-none focus:border-orange-500/50 resize-none"
                placeholder="Explique el motivo del ajuste..."
              />
              {errors.justificacion && <p className="mt-1 text-xs text-red-400">{errors.justificacion.message}</p>}
            </div>

            {serverError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2130]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-400 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Aplicar Ajuste
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
