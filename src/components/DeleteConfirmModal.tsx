import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    title: string;
    description: React.ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function DeleteConfirmModal({
    title,
    description,
    onCancel,
    onConfirm,
    confirmText = "Sí, Eliminar",
    cancelText = "Cancelar"
}: DeleteConfirmModalProps) {
    return (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-[#1a1f2e] border border-red-500/30 p-6 rounded-2xl max-w-xs text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="text-red-400 w-6 h-6" />
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
                        className="flex-1 py-2 text-xs bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}