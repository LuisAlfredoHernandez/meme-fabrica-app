import { useAuthStore } from "@/features/login/store/useAuthStore";
import { X } from "lucide-react";
import { useState } from "react";


// components/layout/ModalPerfil.tsx
export function ModalPerfil({ onClose }: { onClose: () => void }) {
    const { user, updateMyPassword } = useAuthStore();
    const [newPass, setNewPass] = useState("");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm bg-[#13161e] border border-[#1e2130] rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-[#1e2130] flex justify-between items-center">
                    <h2 className="text-white font-bold">M
                        i Perfil</h2>
                    <X className="w-5 h-5 text-slate-500 cursor-pointer" onClick={onClose} />
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-[#0d1018] rounded-2xl border border-white/5">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-black">{user?.nombre[0]}</div>
                        <div>
                            <p className="text-white font-bold">{user?.nombre} {user?.apellido}</p>
                            <p className="text-xs text-slate-500">{user?.rol.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nueva Contraseña</label>
                        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                            className="w-full h-11 bg-[#0d1018] border border-[#1e2130] rounded-xl px-4 text-white text-sm focus:border-orange-500/50 outline-none" />
                    </div>
                    <button onClick={() => { updateMyPassword(newPass); onClose(); }}
                        className="w-full h-11 bg-orange-500 text-white font-bold rounded-xl active:scale-95 transition-all">
                        Actualizar Contraseña
                    </button>
                </div>
            </div>
        </div>
    );
}