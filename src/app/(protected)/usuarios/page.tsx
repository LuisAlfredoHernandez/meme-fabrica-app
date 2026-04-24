"use client";
// ─────────────────────────────────────────────────────────────
// app/usuarios/page.tsx — Gestión de Accesos & RBAC
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
    Plus, Search, ShieldCheck, ShieldAlert,
    UserCog, Trash2, Mail, Clock, MoreHorizontal, Users
} from "lucide-react";
import { ModalGestionOperario } from "@/app/(protected)/operarios/componentes/ModalGestionOperarios";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", violet: "#818cf8", emerald: "#34d399",
    slate: "#475569", red: "#f87171"
};

const ROL_CFG: Record<string, { label: string; color: string; icon: any }> = {
    admin: { label: "Dueño / Admin", color: "#f97316", icon: ShieldCheck },
    subjefe: { label: "Jefe de Taller", color: "#818cf8", icon: UserCog },
    operario: { label: "Operario", color: "#34d399", icon: Clock },
};

export default function UsuariosPage() {
    const [busqueda, setBusqueda] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioAEditar, setUsuarioAEditar] = useState<any>(null);

    // Mock local para la vista
    const [usuarios, setUsuarios] = useState([
        { id: "u1", nombre: "Luis", apellido: "Hernández", email: "l.hernandez@memefabrica.com", rol: "admin", estado: "activo", ultimaConexion: "Hace 10 min" },
        { id: "u2", nombre: "Carmen", apellido: "Méndez", email: "c.mendez@memefabrica.com", rol: "subjefe", estado: "activo", ultimaConexion: "Ayer" },
        { id: "u3", nombre: "Josué", apellido: "Reyes", email: "j.reyes@memefabrica.com", rol: "operario", estado: "inactivo", ultimaConexion: "Hace 3 días" },
    ]);

    const handleOpenGestion = (user?: any) => {
        setUsuarioAEditar(user || null);
        setModalAbierto(true);
    };

    return (
        <div className="flex-1 overflow-auto bg-[#080b10]">
            {/* Reutilizamos tu Modal de Gestión adaptado */}
            {modalAbierto && (
                <ModalGestionOperario
                    onClose={() => setModalAbierto(false)}
                    operarios={usuarios as any} // Pasamos la lista para el buscador interno
                />
            )}

            {/* Header Principal */}
            <div className="px-6 py-5 border-b flex items-center justify-between bg-[#13161e]" style={{ borderColor: C.border }}>
                <div>
                    <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gestión de Usuarios</h1>
                    <p className="text-xs mt-0.5 text-slate-500 font-medium">Control de accesos y permisos de plataforma</p>
                </div>
                <button
                    onClick={() => handleOpenGestion()}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold bg-orange-500 hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-4 h-4" /> Crear Usuario
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats de Seguridad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Cuentas Totales", valor: usuarios.length, icon: Users, color: "#fff" },
                        { label: "Administradores", valor: usuarios.filter(u => u.rol !== 'operario').length, icon: ShieldCheck, color: C.orange },
                        { label: "Sesiones Activas", valor: usuarios.filter(u => u.estado === 'activo').length, icon: Clock, color: C.emerald },
                    ].map((s, i) => (
                        <div key={i} className="p-4 rounded-2xl border bg-[#13161e]/50 flex items-center gap-4" style={{ borderColor: C.border }}>
                            <div className="p-3 rounded-xl bg-white/5"><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                                <p className="text-2xl font-black text-white">{s.valor}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtros y Buscador */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o correo..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm text-white bg-[#13161e] border border-[#1e2130] focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                </div>

                {/* Tabla de Usuarios */}
                <div className="rounded-2xl border bg-[#13161e] overflow-hidden" style={{ borderColor: C.border }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: C.border, background: "rgba(255,255,255,0.02)" }}>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuario</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rol / Permisos</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2130]">
                            {usuarios.map((u) => {
                                const rolInfo = ROL_CFG[u.rol];
                                return (
                                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#0d1018] border border-white/5 flex items-center justify-center text-xs font-black text-white">
                                                    {u.nombre[0]}{u.apellido[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{u.nombre} {u.apellido}</p>
                                                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <rolInfo.icon className="w-4 h-4" style={{ color: rolInfo.color }} />
                                                <span className="text-xs font-bold text-white">{rolInfo.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.estado === 'activo' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                                <span className={`text-[11px] font-bold uppercase ${u.estado === 'activo' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                    {u.estado}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenGestion(u)}
                                                    className="p-2 hover:bg-orange-500/10 rounded-lg text-slate-500 hover:text-orange-500 transition-all"
                                                >
                                                    <UserCog className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}