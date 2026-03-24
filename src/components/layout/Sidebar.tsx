"use client";
// ─────────────────────────────────────────────────────────────
// components/layout/Sidebar.tsx — Navegación global + RBAC
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, ClipboardList, Users, ScanLine,
    Package, Brain, Settings, LogOut, Factory,
    ChevronLeft, ChevronRight, Shield,
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

interface SidebarProps {
    rol?: Rol;
    usuario?: string;
}

export function Sidebar({ rol = "subjefe", usuario = "Jefe Taller" }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const itemsVisibles = NAV.filter(n => n.roles.includes(rol));

    return (
        <aside className="flex flex-col h-screen sticky top-0 transition-all duration-300"
            style={{
                width: collapsed ? 64 : 220,
                background: C.surface,
                borderRight: `1px solid ${C.border}`,
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: C.border }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-lg font-black"
                    style={{ background: C.orange, boxShadow: `0 4px 12px ${C.orange}40` }}>M</div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-white leading-none">Meme Fábricas</p>
                        <p className="text-xs mt-0.5" style={{ color: C.slate }}>Control · IA</p>
                    </div>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {itemsVisibles.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                            style={{
                                background: active ? `${C.orange}18` : "transparent",
                                color: active ? C.orange : "#94a3b8",
                            }}
                            title={collapsed ? item.label : undefined}>
                            <span className="shrink-0">{item.icon}</span>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold truncate">{item.label}</span>
                                        {item.badge && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                                style={{ background: `${item.badgeColor}25`, color: item.badgeColor }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs truncate" style={{ color: C.slate }}>{item.desc}</span>
                                </div>
                            )}
                            {active && <span className="w-1 h-6 rounded-full shrink-0" style={{ background: C.orange }} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Usuario + rol */}
            <div className="border-t p-3 space-y-2" style={{ borderColor: C.border }}>
                {!collapsed && (
                    <div className="flex items-center gap-2 px-2 py-2 rounded-xl"
                        style={{ background: "#0d1018", border: `1px solid ${C.border}` }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: `${ROL_COLOR[rol]}25`, color: ROL_COLOR[rol] }}>
                            {usuario.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{usuario}</p>
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" style={{ color: ROL_COLOR[rol] }} />
                                <p className="text-xs" style={{ color: ROL_COLOR[rol] }}>{ROL_LABEL[rol]}</p>
                            </div>
                        </div>
                    </div>
                )}

                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                    style={{ color: C.slate }}
                    title={collapsed ? "Cerrar sesión" : undefined}>
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="text-xs font-semibold">Cerrar sesión</span>}
                </button>

                {/* Colapsar */}
                <button onClick={() => setCollapsed(v => !v)}
                    className="w-full flex items-center justify-center py-1.5 rounded-xl transition-all"
                    style={{ color: C.slate, border: `1px solid ${C.border}` }}>
                    {collapsed
                        ? <ChevronRight className="w-4 h-4" />
                        : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>
        </aside>
    );
}