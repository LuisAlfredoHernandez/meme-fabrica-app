"use client";
// ─────────────────────────────────────────────────────────────
// app/login/page.tsx — RF17, RF18 | Autenticación + RBAC
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2, Factory, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useRouter } from "next/navigation";
import { AppColors } from "@/shared/constants";

export default function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [verPass, setVerPass] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const login = useAuthStore(state => state.login);
    const router = useRouter();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!usuario.trim()) { setError("Ingresa tu nombre de usuario."); return; }
        if (password.length < 2) { setError("La contraseña debe tener al menos 4 caracteres."); return; }
        setCargando(true);
        const success = await login(usuario, password);
        setCargando(false);
        if (success) {
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.rol === "operario") {
                router.push("/mi-estacion");
            } else {
                router.push("/dashboard");
            }
        } else {
            setError("Credenciales inválidas. Verifica tu usuario y contraseña.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 custom-font-login bg-[#080b10]">
            <style dangerouslySetInnerHTML={{
                __html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #0d1018 inset !important;
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                .custom-font-login, .custom-font-login h1 {
                    font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
                }
            `}} />

            {/* Card */}
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg shadow-orange-500/30 border border-[#1e2130]">
                        <img 
                            src="/icons/icon-192x192.png" 
                            alt="Meme Fábrica Logo" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Meme Fábricas</h1>
                    <p className="text-sm mt-1 text-slate-300 font-medium">Sistema de Control de Producción · IA</p>
                </div>

                <div className="rounded-2xl overflow-hidden bg-[#13161e] border border-[#1e2130]">
                    {/* Formulario */}
                    <form onSubmit={handleLogin} className="p-6 space-y-5">
                        {/* Error banner */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-500/15 border border-red-500/40 text-red-500">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Usuario */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 tracking-wide">Usuario</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="text" value={usuario} onChange={e => { setUsuario(e.target.value); setError(""); }}
                                    placeholder="ej: carmen.mendez"
                                    className="w-full h-12 pl-10 pr-4 rounded-xl text-white text-sm placeholder-slate-600 bg-[#0d1018] border border-[#1e2130] focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all shadow-inner" />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 tracking-wide">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type={verPass ? "text" : "password"} value={password}
                                    onChange={e => { setPassword(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    className="w-full h-12 pl-10 pr-12 rounded-xl text-white text-sm placeholder-slate-600 bg-[#0d1018] border border-[#1e2130] focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all shadow-inner" />
                                <button type="button" onClick={() => setVerPass(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors">
                                    {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={cargando}
                            className={`w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all mt-4 tracking-wide shadow-lg ${cargando ? 'bg-slate-500 cursor-not-allowed shadow-none' : 'bg-orange-500 shadow-orange-500/40 hover:bg-orange-400'}`}>
                            {cargando ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</> : "Ingresar al sistema"}
                        </button>

                    </form>

                    {/* Footer de seguridad */}
                    <div className="px-6 py-4 border-t border-[#1e2130] flex items-center justify-center gap-2 bg-white/5">
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <a href="#" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">¿Olvidaste la contraseña?</a>
                    </div>
                </div>

                <p className="text-center text-xs mt-6 text-slate-400 font-medium tracking-wide">
                    Meme Fábricas © 2026 · Santo Domingo, R.D.
                </p>
            </div>
        </div>
    );
}