"use client";

import { AppColors } from "@/shared/constants";

interface StatCardProps {
    label: string;
    labelColor?: string;
    valor: string | number;
    icon?: React.ElementType;
    color?: string;
}

export const StatCard = ({ label, valor, icon: Icon, color, labelColor }: StatCardProps) => (
    <div
        className="p-4 rounded-2xl border bg-[#13161e]/50 flex items-center gap-4"
        style={{ borderColor: AppColors.border }}
    >
        {Icon ? <div className="p-3 rounded-xl bg-white/5">
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
            : null}
        <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {label}
            </p>
            <p className="text-2xl font-black text-white" style={{ color: labelColor ?? "" }}>
                {valor}
            </p>
        </div>
    </div>
);
