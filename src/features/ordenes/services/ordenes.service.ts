
// ─────────────────────────────────────────────────────────────
// features/ordenes/services/ordenes.service.ts — Mocks
// ─────────────────────────────────────────────────────────────
export type EstadoOrden = "pendiente" | "en_proceso" | "pausada" | "completada";
export type Prioridad = "baja" | "normal" | "alta" | "urgente";
export type TipoOP = "MTO" | "MTS";

export interface Orden {
    id: string; numero: string; cliente: string; tipo: TipoOP;
    prenda: string; cantidad: number; completadas: number;
    estado: EstadoOrden; prioridad: Prioridad;
    fechaEntrega: string; creadaEn: string; cola: number;
}

export const ORDENES_MOCK: Orden[] = [
    { id: "o1", numero: "ORD-2026-0042", cliente: "Boutique Bella", tipo: "MTO", prenda: "Licra deportiva", cantidad: 150, completadas: 104, estado: "en_proceso", prioridad: "urgente", fechaEntrega: "2026-03-17", creadaEn: "2026-03-01", cola: 1 },
    { id: "o2", numero: "ORD-2026-0043", cliente: "ModaRD Store", tipo: "MTO", prenda: "Jogger tela micro", cantidad: 200, completadas: 55, estado: "en_proceso", prioridad: "alta", fechaEntrega: "2026-03-22", creadaEn: "2026-03-05", cola: 2 },
    { id: "o3", numero: "ORD-2026-0044", cliente: "Stock interno", tipo: "MTS", prenda: "T-shirt básico", cantidad: 300, completadas: 0, estado: "pendiente", prioridad: "normal", fechaEntrega: "2026-03-30", creadaEn: "2026-03-08", cola: 3 },
    { id: "o4", numero: "ORD-2026-0045", cliente: "Zoe Boutique", tipo: "MTO", prenda: "Vestido verano", cantidad: 80, completadas: 80, estado: "completada", prioridad: "alta", fechaEntrega: "2026-03-10", creadaEn: "2026-02-28", cola: 4 },
    { id: "o5", numero: "ORD-2026-0046", cliente: "Stock interno", tipo: "MTS", prenda: "Short licra", cantidad: 120, completadas: 0, estado: "pausada", prioridad: "baja", fechaEntrega: "2026-04-05", creadaEn: "2026-03-09", cola: 5 },
];
