"use client";
// ─────────────────────────────────────────────────────────────
// components/layout/Sidebar.tsx — Modern Hover Expansion UX
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, ClipboardList, Users, ScanLine,
    Package, Brain, Settings, LogOut, Shield, Factory
} from "lucide-react";

const C = {
    bg: "#080b10", surface: "#13161e", border: "#1e2130",
    orange: "#f97316", slate: "#475569",
};

type Rol = "dueno" | "subjefe" | "operario";

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
    desc: string;
    roles: Rol[];
    badge?: string;
    badgeColor?: string;
}

const NAV: NavItem[] = [
    { href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", desc: "KPIs y métricas", roles: ["dueno", "subjefe"] },
    { href: "/ordenes", icon: <ClipboardList className="w-5 h-5" />, label: "Órdenes", desc: "Producción y cola", roles: ["dueno", "subjefe"] },
    { href: "/registro", icon: <ScanLine className="w-5 h-5" />, label: "Registrar", desc: "Captura diaria", roles: ["dueno", "subjefe", "operario"] },
    { href: "/operarios", icon: <Users className="w-5 h-5" />, label: "Operarios", desc: "RRHH y asignación", roles: ["dueno", "subjefe"] },
    { href: "/insumos", icon: <Package className="w-5 h-5" />, label: "Insumos", desc: "Materiales y stock", roles: ["dueno", "subjefe"] },
    { href: "/ia", icon: <Brain className="w-5 h-5" />, label: "IA Predictiva", desc: "Modelos y predicciones", roles: ["dueno"], badge: "IA", badgeColor: "#818cf8" },
];

const ROL_LABEL: Record<Rol, string> = {
    dueno: "Dueño", subjefe: "Jefe de Taller", operario: "Operario",
};
const ROL_COLOR: Record<Rol, string> = {
    dueno: "#f97316", subjefe: "#818cf8", operario: "#34d399",
};

export function Sidebar({ rol = "subjefe", usuario = "Jefe Taller" }: { rol?: Rol; usuario?: string }) {
    // Cambiamos el estado a isHovered para mayor claridad semántica
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();

    const itemsVisibles = NAV.filter(n => n.roles.includes(rol));

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex flex-col h-screen sticky top-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-40"
            style={{
                width: isHovered ? 260 : 80,
                background: C.surface,
                borderRight: `1px solid ${C.border}`,
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>

            {/* Logo Section */}
            <div className="flex items-center gap-4 px-5 py-6 border-b" style={{ borderColor: C.border }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg font-black transition-transform duration-500"
                    style={{
                        background: C.orange,
                        boxShadow: `0 4px 15px ${C.orange}40`,
                        transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)'
                    }}>M</div>
                <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                    <p className="text-sm font-black text-white leading-none whitespace-nowrap">Meme Fábricas</p>
                    <p className="text-[10px] mt-1 font-bold uppercase tracking-widest" style={{ color: C.slate }}>Control · IA</p>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {itemsVisibles.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}
                            // Añadimos hover:bg-[#818cf815] para el feedback sutil solicitado
                            className="flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group relative hover:bg-[#818cf815]"
                            style={{
                                background: active ? `${C.orange}15` : "transparent",
                                color: active ? C.orange : "#64748b",
                            }}
                            title={isHovered ? undefined : item.label}>

                            <span className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#818cf8]'}`}>
                                {item.icon}
                            </span>

                            <div className={`flex-1 min-w-0 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold truncate whitespace-nowrap transition-colors duration-300 ${active ? 'text-orange-500' : 'group-hover:text-white'}`}>
                                        {item.label}
                                    </span>
                                    {item.badge && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                                            style={{ background: `${item.badgeColor}20`, color: item.badgeColor }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] truncate whitespace-nowrap font-medium" style={{ color: C.slate }}>{item.desc}</p>
                            </div>

                            {active && (
                                <div className="absolute right-0 w-1 h-5 rounded-l-full" style={{ background: C.orange }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer: Usuario + Icono Giratorio */}
            <div className="p-4 border-t space-y-3" style={{ borderColor: C.border }}>

                {/* Info de Usuario */}
                <div className="relative flex items-center gap-3 px-2 py-2 rounded-2xl transition-colors overflow-hidden"
                    style={{ background: isHovered ? "#0d1018" : "transparent", border: `1px solid ${isHovered ? C.border : 'transparent'}` }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-inner"
                        style={{ background: `${ROL_COLOR[rol]}20`, color: ROL_COLOR[rol], border: `1px solid ${ROL_COLOR[rol]}40` }}>
                        {usuario.slice(0, 2).toUpperCase()}
                    </div>

                    <div className={`flex-1 min-w-0 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                        <p className="text-xs font-bold text-white truncate">{usuario}</p>
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3" style={{ color: ROL_COLOR[rol] }} />
                            <p className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: ROL_COLOR[rol] }}>{ROL_LABEL[rol]}</p>
                        </div>
                    </div>

                    {/* ICONO ESTÉTICO GIRATORIO (Settings Gear) */}
                    <div className="shrink-0 transition-all duration-700 ease-in-out"
                        style={{
                            transform: isHovered ? 'rotate(360deg)' : 'rotate(0deg)',
                            opacity: isHovered ? 1 : 0.4
                        }}>
                        <Settings className={`w-4 h-4 ${isHovered ? 'text-orange-500' : 'text-slate-500'}`} />
                    </div>
                </div>

                {/* Logout Button */}
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group hover:bg-red-500/10"
                    style={{ color: C.slate }}>
                    <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-400 transition-colors" />
                    <span className={`text-xs font-bold transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        Cerrar sesión
                    </span>
                </button>
            </div>
        </aside>
    );
}