// ─────────────────────────────────────────────────────────────
// features/insumos/services/insumos.service.ts — Mocks & Service
// ─────────────────────────────────────────────────────────────
import type { Insumo } from "@/types";
export type TipoInsumo = "tela" | "accesorio";

export const INSUMOS_MOCK: Insumo[] = [
    { id: "i1", codigo: "TEL-001", nombre: "Tela micro azul rey", tipo: "tela", subtipo: "micro", unidad: "metros", stock: 45, minimo: 20, proveedor: "Textiles RD", vinculadoA: ["ORD-2026-0042"] },
    { id: "i2", codigo: "TEL-002", nombre: "Tela licra negra", tipo: "tela", subtipo: "licra", unidad: "metros", stock: 12, minimo: 15, proveedor: "ImportaTex", vinculadoA: ["ORD-2026-0043"] },
    { id: "i3", codigo: "TEL-003", nombre: "Tela mono beige", tipo: "tela", subtipo: "mono", unidad: "metros", stock: 80, minimo: 10, proveedor: "Textiles RD", vinculadoA: ["ORD-2026-0044"] },
    { id: "i4", codigo: "ACC-001", nombre: "Zippers negros #5", tipo: "accesorio", subtipo: "zipper", unidad: "unidades", stock: 320, minimo: 100, proveedor: "AccesoriosDO", vinculadoA: ["ORD-2026-0042"] },
    { id: "i5", codigo: "ACC-002", nombre: "Gomas elásticas 2cm", tipo: "accesorio", subtipo: "goma", unidad: "metros", stock: 8, minimo: 20, proveedor: "ElásticosCaribeño", vinculadoA: ["ORD-2026-0043"] },
    { id: "i6", codigo: "ACC-003", nombre: "Hilo poliéster negro", tipo: "accesorio", subtipo: "hilo", unidad: "rollos", stock: 15, minimo: 8, proveedor: "HilosNatl", vinculadoA: ["ORD-2026-0042", "ORD-2026-0043"] },
    { id: "i7", codigo: "ACC-004", nombre: "Botones metálicos 18mm", tipo: "accesorio", subtipo: "boton", unidad: "unidades", stock: 0, minimo: 50, proveedor: "AccesoriosDO", vinculadoA: [] },
];

// Simulamos la latencia de una llamada a la API
const API_LATENCY = 500; // 0.5 segundos

/**
 * Servicio para la gestión de insumos.
 * Imita las llamadas a una API REST utilizando los datos mockeados.
 */
export const insumosService = {
  /**
   * Obtiene todos los insumos disponibles.
   * @returns Una promesa que resuelve con la lista de insumos.
   */
  getAll: (): Promise<Insumo[]> => {
    console.log("Fetching all insumos from mock service...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Insumos fetched successfully.");
        resolve(INSUMOS_MOCK);
      }, API_LATENCY);
    });
  },

/**
   * Crea un nuevo insumo y lo añade a la lista.
   * @param data - Los datos del nuevo insumo (sin el ID).
   * @returns Una promesa que resuelve con el insumo creado.
   */
  
create: (data: Omit<Insumo, "id">): Promise<Insumo> => {
    console.log("Creating new insumo...", data);
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoInsumo: Insumo = {
          ...data,
          // Generamos un ID aleatorio o basado en timestamp para el mock
          id: Math.random().toString(36).substr(2, 9),
        };
        
        console.log(`Insumo created successfully with ID: ${nuevoInsumo.id}`);
        resolve(nuevoInsumo);
      }, API_LATENCY);
    });
  },

  /**
   * Actualiza un insumo existente por su ID.
   * @param id - El ID del insumo a actualizar.
   * @param data - Los campos parciales a modificar.
   * @returns Una promesa que resuelve con el insumo actualizado o lanza error si no existe.
   */
  update: (id: string, data: Partial<Insumo>): Promise<Insumo> => {
    console.log(`Updating insumo with id: ${id}...`, data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = INSUMOS_MOCK.findIndex((i) => i.id === id);
        
        if (index === -1) {
          console.error("Update failed: Insumo not found.");
          reject(new Error("Insumo no encontrado"));
          return;
        }

        // Combinamos los datos antiguos con los nuevos
        const insumoActualizado = { ...INSUMOS_MOCK[index], ...data };
        INSUMOS_MOCK[index] = insumoActualizado;

        console.log(`Insumo ${id} updated successfully.`);
        resolve(insumoActualizado);
      }, API_LATENCY);
    });
  },

  /**
   * Obtiene un insumo por su ID.
   * @param id - El ID del insumo a buscar.
   * @returns Una promesa que resuelve con el insumo o undefined si no se encuentra.
   */
  getById: (id: string): Promise<Insumo | undefined> => {
    console.log(`Fetching insumo with id: ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const insumo = INSUMOS_MOCK.find((i) => i.id === id);
        console.log(insumo ? `Found insumo: ${insumo.nombre}` : "Insumo not found.");
        resolve(insumo);
      }, API_LATENCY);
    });
  },
};
