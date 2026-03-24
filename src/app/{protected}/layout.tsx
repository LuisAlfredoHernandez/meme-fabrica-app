// ─────────────────────────────────────────────────────────────
// app/(protected)/layout.tsx — Layout con Sidebar para rutas protegidas
// ─────────────────────────────────────────────────────────────
// Usa este layout en: dashboard, ordenes, registro, operarios, insumos, ia
// La ruta /login usa su propio layout sin sidebar

import { Sidebar } from "@/components/layout/Sidebar";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen" style={{ background: "#080b10" }}>
            {/* Sidebar con rol mock — en producción leer del JWT/session */}
            <Sidebar rol="subjefe" usuario="Jefe de Taller" />
            {/* Contenido principal */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {children}
            </main>
        </div>
    );
}