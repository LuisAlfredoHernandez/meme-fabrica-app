
// ─────────────────────────────────────────────────────────────
// features/insumos/services/insumos.service.ts — Mocks
// ─────────────────────────────────────────────────────────────

export type TipoInsumo = "tela" | "accesorio";

export interface Insumo {
    id: string; codigo: string; nombre: string; tipo: TipoInsumo; subtipo: string;
    unidad: string; stock: number; minimo: number; proveedor: string;
    vinculadoA: string[];
}

export const INSUMOS_MOCK: Insumo[] = [
    { id: "i1", codigo: "TEL-001", nombre: "Tela micro azul rey", tipo: "tela", subtipo: "micro", unidad: "metros", stock: 45, minimo: 20, proveedor: "Textiles RD", vinculadoA: ["ORD-2026-0042"] },
    { id: "i2", codigo: "TEL-002", nombre: "Tela licra negra", tipo: "tela", subtipo: "licra", unidad: "metros", stock: 12, minimo: 15, proveedor: "ImportaTex", vinculadoA: ["ORD-2026-0043"] },
    { id: "i3", codigo: "TEL-003", nombre: "Tela mono beige", tipo: "tela", subtipo: "mono", unidad: "metros", stock: 80, minimo: 10, proveedor: "Textiles RD", vinculadoA: ["ORD-2026-0044"] },
    { id: "i4", codigo: "ACC-001", nombre: "Zippers negros #5", tipo: "accesorio", subtipo: "zipper", unidad: "unidades", stock: 320, minimo: 100, proveedor: "AccesoriosDO", vinculadoA: ["ORD-2026-0042"] },
    { id: "i5", codigo: "ACC-002", nombre: "Gomas elásticas 2cm", tipo: "accesorio", subtipo: "goma", unidad: "metros", stock: 8, minimo: 20, proveedor: "ElásticosCaribeño", vinculadoA: ["ORD-2026-0043"] },
    { id: "i6", codigo: "ACC-003", nombre: "Hilo poliéster negro", tipo: "accesorio", subtipo: "hilo", unidad: "rollos", stock: 15, minimo: 8, proveedor: "HilosNatl", vinculadoA: ["ORD-2026-0042", "ORD-2026-0043"] },
    { id: "i7", codigo: "ACC-004", nombre: "Botones metálicos 18mm", tipo: "accesorio", subtipo: "boton", unidad: "unidades", stock: 0, minimo: 50, proveedor: "AccesoriosDO", vinculadoA: [] },
];
