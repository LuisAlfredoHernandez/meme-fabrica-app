import { Trash2, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface DeleteConfirmModalProps {
    title: string;
    description: React.ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "success" | "info";
    icon?: React.ReactNode;
}

export function DeleteConfirmModal({
    title,
    description,
    onCancel,
    onConfirm,
    confirmText = "Sí, Eliminar",
    cancelText = "Cancelar",
    variant = "danger",
    icon
}: DeleteConfirmModalProps) {
    
    // Configuración según el variant
    let borderClass = "border-red-500/30";
    let iconBgClass = "bg-red-500/20";
    let iconTextClass = "text-red-400";
    let confirmBtnClass = "bg-red-500 hover:bg-red-600";
    let defaultIcon = <Trash2 className="w-6 h-6" />;

    if (variant === "success") {
        borderClass = "border-emerald-500/30";
        iconBgClass = "bg-emerald-500/20";
        iconTextClass = "text-emerald-400";
        confirmBtnClass = "bg-emerald-500 hover:bg-emerald-600";
        defaultIcon = <CheckCircle2 className="w-6 h-6" />;
    } else if (variant === "warning") {
        borderClass = "border-amber-500/30";
        iconBgClass = "bg-amber-500/20";
        iconTextClass = "text-amber-400";
        confirmBtnClass = "bg-amber-500 hover:bg-amber-600";
        defaultIcon = <AlertTriangle className="w-6 h-6" />;
    } else if (variant === "info") {
        borderClass = "border-blue-500/30";
        iconBgClass = "bg-blue-500/20";
        iconTextClass = "text-blue-400";
        confirmBtnClass = "bg-blue-500 hover:bg-blue-600";
        defaultIcon = <Info className="w-6 h-6" />;
    }

    const finalIcon = icon ? icon : defaultIcon;

    return (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className={`bg-[#1a1f2e] border ${borderClass} p-6 rounded-2xl max-w-xs text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
                <div className={`w-12 h-12 ${iconBgClass} ${iconTextClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {finalIcon}
                </div>

                <h4 className="text-white font-bold">{title}</h4>

                <p className="text-xs text-slate-400 mt-2">
                    {description}
                </p>

                <div className="flex gap-2 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2 text-xs text-slate-500 font-bold hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 py-2 text-xs ${confirmBtnClass} text-white font-bold rounded-lg shadow-lg transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}