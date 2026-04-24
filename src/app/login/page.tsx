"use client";
// ─────────────────────────────────────────────────────────────
// app/login/page.tsx — RF17, RF18 | Autenticación + RBAC
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2, Factory } from "lucide-react";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useRouter } from "next/navigation";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", emerald: "#34d399", red: "#f87171", slate: "#475569",
};

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
        if (success) router.push("/dashboard");
        else setError("Credenciales inválidas. Verifica tu usuario y contraseña.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: C.bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Card */}
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: C.orange, boxShadow: `0 8px 32px ${C.orange}50` }}>
                        <Factory className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Meme Fábricas</h1>
                    <p className="text-sm mt-1" style={{ color: C.slate }}>Sistema de Control de Producción · IA</p>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {/* Formulario */}
                    <form onSubmit={handleLogin} className="p-5 space-y-4">
                        {/* Error banner */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                                style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, color: C.red }}>
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Usuario */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Usuario</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.slate }} />
                                <input type="text" value={usuario} onChange={e => { setUsuario(e.target.value); setError(""); }}
                                    placeholder="ej: carmen.mendez"
                                    className="w-full h-12 pl-10 pr-4 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none transition-colors"
                                    style={{ background: "#0d1018", border: `1.5px solid ${usuario ? C.orange : C.border}` }} />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.slate }} />
                                <input type={verPass ? "text" : "password"} value={password}
                                    onChange={e => { setPassword(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    className="w-full h-12 pl-10 pr-12 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none transition-colors"
                                    style={{ background: "#0d1018", border: `1.5px solid ${password ? C.orange : C.border}` }} />
                                <button type="button" onClick={() => setVerPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: C.slate }}>
                                    {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={cargando}
                            className="w-full h-13 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all mt-2"
                            style={{
                                height: 52,
                                background: cargando ? C.slate : C.orange,
                                boxShadow: cargando ? "none" : `0 4px 20px ${C.orange}40`,
                                cursor: cargando ? "not-allowed" : "pointer",
                            }}>
                            {cargando ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</> : "Ingresar al sistema"}
                        </button>

                    </form>

                    {/* Footer de seguridad */}
                    <div className="px-5 py-3 border-t flex items-center gap-2" style={{ borderColor: C.border }}>
                        <Lock className="w-3 h-3" style={{ color: C.slate }} />
                        <a href="https://www.google.com/" className="text-xs" style={{ color: C.slate }}>Olvidaste la contraseña?</a>
                    </div>
                </div>

                <p className="text-center text-xs mt-4" style={{ color: "#334155" }}>
                    Meme Fábricas © 2026 · Santo Domingo, R.D.
                </p>
            </div>
        </div>
    );
}