"use client";
// ─────────────────────────────────────────────────────────────
// app/(protected)/layout.tsx — Layout con Sidebar para rutas protegidas
// ─────────────────────────────────────────────────────────────
// Usa este layout en: dashboard, ordenes, registro, operarios, insumos, ia
// La ruta /login usa su propio layout sin sidebar

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/features/login/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login");
        }
    }, [mounted, isAuthenticated, router]);

    // Redireccion por defecto al login si el usuario es operador e intenta ir a otra parte,
    // o redirección principal despues de login
    useEffect(() => {
        if (mounted && user) {
            if (user.rol === "operario" && pathname !== "/mi-estacion") {
                router.push("/mi-estacion");
            } else if ((user.rol === "admin" || user.rol === "subjefe") && pathname === "/") {
                 router.push("/dashboard");
            }
        }
    }, [mounted, user, pathname, router]);


    if (!mounted || !isAuthenticated || !user) {
        return <div className="min-h-screen bg-[#080b10]" />; // Evitar flashes
    }

    return (
        <div className="flex min-h-screen" style={{ background: "#080b10" }}>
            <Sidebar rol={user.rol} usuario={`${user.nombre} ${user.apellido}`} />
            {/* Contenido principal */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {children}
            </main>
        </div>
    );
}