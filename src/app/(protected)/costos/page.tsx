"use client";

import { AppColors } from "@/shared/constants";
import { Wrench } from "lucide-react";
import { Header } from "@/components/Header";

export default function CostosPage() {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 text-white max-h-screen custom-scrollbar" style={{ background: AppColors.bg }}>
            <div className="space-y-5 h-full flex flex-col">
                <Header
                    title="Costos"
                    subtitle="Análisis financiero y rentabilidad de la producción."
                />
                
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="bg-[#13161e] border border-[#1e2130] rounded-2xl p-12 flex flex-col items-center max-w-md w-full text-center shadow-2xl">
                        <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                            <Wrench className="w-10 h-10 text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-2">Módulo en Construcción</h1>
                        <p className="text-sm text-slate-400">
                            Estamos trabajando arduamente para traerte esta nueva funcionalidad de control de costos muy pronto.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
