import { AppColors } from "@/shared/constants";
import { Plus } from "lucide-react";

interface HeaderProps {
    title: string;
    subtitle?: string;
    buttonLabel: string;
    onButtonClick?: () => void;
}

export function Header({ title, buttonLabel, subtitle, onButtonClick }: HeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <p className="text-sm text-slate-500">{subtitle ? subtitle : ""}</p>
            </div>
            <button
                onClick={onButtonClick}
                className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
                style={{ background: AppColors.orange, color: "#fff" }}
            >
                <Plus className="w-5 h-5" /> {buttonLabel}
            </button>
        </div>
    );
}
