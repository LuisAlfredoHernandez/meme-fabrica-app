
// ─────────────────────────────────────────────────────────────
// features/ordenes/services/ordenes.service.ts — Mocks

import { Orden } from "@/types";


export const ORDENES_MOCK: Orden[] = [
    {
        id: "o1",
        numero: "ORD-2026-0042",
        cliente: "Boutique Bella",
        tipo: "MTO",
        estado: "en_proceso",
        temporada: "primavera",
        prioridad: "urgente",
        fechaCreacion: "2026-03-01",
        fechaEntregaEstimada: "2026-03-17",
        creadaPor: "u1",
        cola: 1,
        lineas: [
            { productoTipo: "licra", descripcion: "Licra deportiva", cantidad: 150, cantidadCompletada: 104, talla: "M", color: "Azul Rey", insumos: [] }
        ]
    },
    {
        id: "o2",
        numero: "ORD-2026-0043",
        cliente: "ModaRD Store",
        tipo: "MTO",
        estado: "en_proceso",
        temporada: "verano",
        prioridad: "alta",
        fechaCreacion: "2026-03-05",
        fechaEntregaEstimada: "2026-03-22",
        creadaPor: "u1",
        cola: 2,
        lineas: [
            { productoTipo: "jogger", descripcion: "Jogger tela micro", cantidad: 200, cantidadCompletada: 55, talla: "L", color: "Negro", insumos: [] }
        ]
    },
    {
        id: "o3",
        numero: "ORD-2026-0044",
        cliente: "Stock interno",
        tipo: "MTS",
        estado: "pendiente",
        temporada: "invierno",
        prioridad: "normal",
        fechaCreacion: "2026-03-08",
        fechaEntregaEstimada: "2026-03-30",
        creadaPor: "u2",
        cola: 3,
        lineas: [
            { productoTipo: "t_shirt", descripcion: "T-shirt básico", cantidad: 300, cantidadCompletada: 0, talla: "S", color: "Blanco", insumos: [] }
        ]
    },
    {
        id: "o4",
        numero: "ORD-2026-0045",
        cliente: "Zoe Boutique",
        tipo: "MTO",
        estado: "completada",
        temporada: "verano",
        prioridad: "alta",
        fechaCreacion: "2026-02-28",
        fechaEntregaEstimada: "2026-03-10",
        creadaPor: "u1",
        cola: 4,
        lineas: [
            { productoTipo: "vestido", descripcion: "Vestido verano", cantidad: 80, cantidadCompletada: 80, talla: "S", color: "Floral", insumos: [] }
        ]
    },
    {
        id: "o5",
        numero: "ORD-2026-0046",
        cliente: "Stock interno",
        tipo: "MTS",
        estado: "pausada",
        temporada: "otoño",
        prioridad: "baja",
        fechaCreacion: "2026-03-09",
        fechaEntregaEstimada: "2026-04-05",
        creadaPor: "u2",
        cola: 5,
        lineas: [
            { productoTipo: "licra", descripcion: "Short licra", cantidad: 120, cantidadCompletada: 0, talla: "M", color: "Gris", insumos: [] }
        ]
    },
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