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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {buttonLabel && (
                <button
                    onClick={onButtonClick}
                    className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95 w-full sm:w-auto justify-center cursor-pointer shrink-0"
                    style={{ background: AppColors.orange, color: "#fff" }}
                >
                    <Plus className="w-5 h-5 shrink-0" /> {buttonLabel}
                </button>
            )}
        </div>
    );
}
