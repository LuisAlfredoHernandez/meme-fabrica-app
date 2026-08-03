"use client";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AppColors } from "@/shared/constants";

export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: AppColors.bg }}>
            <LoadingScreen message="Cargando Meme Fábricas..." />
        </div>
    );
}
