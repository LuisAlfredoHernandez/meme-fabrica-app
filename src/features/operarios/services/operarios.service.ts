// ─────────────────────────────────────────────────────────────
// features/operarios/services/operarios.service.ts — Mocks & Service
// ─────────────────────────────────────────────────────────────
import type { Operario } from "@/types";

const MOCK_OPERARIOS: Operario[] = [
    { id: "e1", nombre: "Carmen", apellido: "Méndez", rol: "operario", habilidades: [{ maquina: "merrow", nivelEficiencia: 92 }, { maquina: "cover", nivelEficiencia: 85 }], estado: "activo", maquinaActual: "MERROW-01", ordenActual: "ORD-2026-0042" },
    { id: "e2", nombre: "Josué", apellido: "Reyes", rol: "operario", habilidades: [{ maquina: "cover", nivelEficiencia: 74 }, { maquina: "plana", nivelEficiencia: 90 }], estado: "activo", maquinaActual: "COVER-02", ordenActual: "ORD-2026-0042" },
    { id: "e3", nombre: "María", apellido: "Santos", rol: "operario", habilidades: [{ maquina: "corte", nivelEficiencia: 91 }], estado: "activo", maquinaActual: "CORTE-01", ordenActual: "ORD-2026-0043" },
    { id: "e4", nombre: "Rafael", apellido: "Núñez", rol: "operario", habilidades: [{ maquina: "merrow", nivelEficiencia: 82 }, { maquina: "plana", nivelEficiencia: 65 }], estado: "inactivo" },
    { id: "e6", nombre: "Luis", apellido: "Castro", rol: "operario", habilidades: [{ maquina: "merrow", nivelEficiencia: 95 }, { maquina: "cover", nivelEficiencia: 88 }], estado: "activo", maquinaActual: "MERROW-02", ordenActual: "ORD-2026-0043" },
];

// Simulamos la latencia de una llamada a la API
const API_LATENCY = 500; // 0.5 segundos

/**
 * Servicio para la gestión de operario.
 * Imita las llamadas a una API REST utilizando los datos mockeados.
 */
export const operariosService = {
  /**
   * Obtiene todos los operario disponibles.
   * @returns Una promesa que resuelve con la lista de operario.
   */
  getAll: (): Promise<Operario[]> => {
    console.log("Fetching all operario from mock service...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("operario fetched successfully.");
        resolve(MOCK_OPERARIOS);
      }, API_LATENCY);
    });
  },

/**
   * Crea un nuevo operario y lo añade a la lista.
   * @param data - Los datos del nuevo operario (sin el ID).
   * @returns Una promesa que resuelve con el operario creado.
   */
  
create: (data: Omit<Operario, "id">): Promise<Operario> => {
    console.log("Creating new operario...", data);
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoInsumo: Operario = {
          ...data,
          // Generamos un ID aleatorio o basado en timestamp para el mock
          id: Math.random().toString(36).substr(2, 9),
        };
        
        console.log(`Operario created successfully with ID: ${nuevoInsumo.id}`);
        resolve(nuevoInsumo);
      }, API_LATENCY);
    });
  },

  /**
   * Actualiza un operario existente por su ID.
   * @param id - El ID del operario a actualizar.
   * @param data - Los campos parciales a modificar.
   * @returns Una promesa que resuelve con el operario actualizado o lanza error si no existe.
   */
  update: (id: string, data: Partial<Operario>): Promise<Operario> => {
    console.log(`Updating operario with id: ${id}...`, data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_OPERARIOS.findIndex((i) => i.id === id);
        
        if (index === -1) {
          console.error("Update failed: Operario not found.");
          reject(new Error("Operario no encontrado"));
          return;
        }

        // Combinamos los datos antiguos con los nuevos
        const oprarioActualizado = { ...MOCK_OPERARIOS[index], ...data };
        MOCK_OPERARIOS[index] = oprarioActualizado;

        console.log(`Operario ${id} updated successfully.`);
        resolve(oprarioActualizado);
      }, API_LATENCY);
    });
  },
  
  delete: (id: string): Promise<boolean> => {
      console.log(`Solicitando eliminación del operario con ID: ${id}...`);
      
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              // Buscamos el índice del elemento en nuestro "mock"
              const index = MOCK_OPERARIOS.findIndex(operario => operario.id === id);

              if (index !== -1) {
                  // Eliminamos el elemento del array global (persistencia simulada)
                  
                  // INSUMOS_MOCK.splice(index, 1);
                  
                  console.log(`Operario ${id} eliminado correctamente del Mock.`);
                  resolve(true);
              } else {
                  // Si por alguna razón el ID no existe
                  console.error(`Error: Operario con ID ${id} no encontrado.`);
                  reject(new Error("El operario que intentas eliminar no existe en el sistema."));
              }
          }, API_LATENCY);
      });
  },

  /**
   * Obtiene un operario por su ID.
   * @param id - El ID del operario a buscar.
   * @returns Una promesa que resuelve con el operario o undefined si no se encuentra.
   */
  getById: (id: string): Promise<Operario | undefined> => {
    console.log(`Fetching operario with id: ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const operario = MOCK_OPERARIOS.find((i) => i.id === id);
        console.log(operario ? `Found operario: ${operario.nombre}` : "Operario not found.");
        resolve(operario);
      }, API_LATENCY);
    });
  },
};
