
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
    fechaEntrega: string; fechaCreacion: string; cola: number;
}

export const ORDENES_MOCK: Orden[] = [
    { id: "o1", numero: "ORD-2026-0042", cliente: "Boutique Bella", tipo: "MTO", prenda: "Licra deportiva", cantidad: 150, completadas: 104, estado: "en_proceso", prioridad: "urgente", fechaEntrega: "2026-03-17", fechaCreacion: "2026-03-01", cola: 1 },
    { id: "o2", numero: "ORD-2026-0043", cliente: "ModaRD Store", tipo: "MTO", prenda: "Jogger tela micro", cantidad: 200, completadas: 55, estado: "en_proceso", prioridad: "alta", fechaEntrega: "2026-03-22", fechaCreacion: "2026-03-05", cola: 2 },
    { id: "o3", numero: "ORD-2026-0044", cliente: "Stock interno", tipo: "MTS", prenda: "T-shirt básico", cantidad: 300, completadas: 0, estado: "pendiente", prioridad: "normal", fechaEntrega: "2026-03-30", fechaCreacion: "2026-03-08", cola: 3 },
    { id: "o4", numero: "ORD-2026-0045", cliente: "Zoe Boutique", tipo: "MTO", prenda: "Vestido verano", cantidad: 80, completadas: 80, estado: "completada", prioridad: "alta", fechaEntrega: "2026-03-10", fechaCreacion: "2026-02-28", cola: 4 },
    { id: "o5", numero: "ORD-2026-0046", cliente: "Stock interno", tipo: "MTS", prenda: "Short licra", cantidad: 120, completadas: 0, estado: "pausada", prioridad: "baja", fechaEntrega: "2026-04-05", fechaCreacion: "2026-03-09", cola: 5 },
];

const API_LATENCY = 500;

/**
 * Servicio para la gestión de órdenes de producción.
 * Simula operaciones CRUD sobre el estado de la fábrica.
 */
export const ordenesService = {
    /**
     * Obtiene todas las órdenes de la cola de producción.
     */
    getAll: (): Promise<Orden[]> => {
        console.log("Fetching all orders from mock service...");
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("Orders fetched successfully.");
                resolve(ORDENES_MOCK);
            }, API_LATENCY);
        });
    },

    /**
     * Registra una nueva orden en el sistema.
     * @param data - Datos de la orden sin el ID.
     */
    create: (data: Omit<Orden, "id">): Promise<Orden> => {
        console.log("Creating new order...", data);
        return new Promise((resolve) => {
            setTimeout(() => {
                const nuevaOrden: Orden = {
                    ...data,
                    // Generación de ID único para el mock
                    id: `o${Math.random().toString(36).substr(2, 5)}`,
                };
                
                // Persistencia simulada
                ORDENES_MOCK.push(nuevaOrden);
                
                console.log(`Order created successfully with ID: ${nuevaOrden.id}`);
                resolve(nuevaOrden);
            }, API_LATENCY);
        });
    },

    /**
     * Actualiza el progreso o datos de una orden (ej: aumentar completadas).
     */
    update: (id: string, data: Partial<Orden>): Promise<Orden> => {
        console.log(`Updating order with id: ${id}...`, data);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = ORDENES_MOCK.findIndex((o) => o.id === id);
                
                if (index === -1) {
                    console.error("Update failed: Order not found.");
                    reject(new Error("Orden de producción no encontrada"));
                    return;
                }

                const ordenActualizada = { ...ORDENES_MOCK[index], ...data };
                ORDENES_MOCK[index] = ordenActualizada;

                console.log(`Order ${id} updated successfully.`);
                resolve(ordenActualizada);
            }, API_LATENCY);
        });
    },

    /**
     * Elimina una orden del sistema.
     */
    delete: (id: string): Promise<boolean> => {
        console.log(`Solicitando eliminación de la orden con ID: ${id}...`);
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = ORDENES_MOCK.findIndex(orden => orden.id === id);

                if (index !== -1) {
                    // Eliminación real del array para el mock
                    ORDENES_MOCK.splice(index, 1);
                    console.log(`Orden ${id} eliminada correctamente del Mock.`);
                    resolve(true);
                } else {
                    console.error(`Error: Orden con ID ${id} no encontrada.`);
                    reject(new Error("La orden que intentas eliminar no existe."));
                }
            }, API_LATENCY);
        });
    },

    /**
     * Obtiene los detalles de una orden específica.
     */
    getById: (id: string): Promise<Orden | undefined> => {
        console.log(`Fetching order with id: ${id}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const orden = ORDENES_MOCK.find((o) => o.id === id);
                console.log(orden ? `Found order: ${orden.numero}` : "Order not found.");
                resolve(orden);
            }, API_LATENCY);
        });
    },
};