import { Maquina, TipoMaquina, } from "@/types";

// Simulación de base de datos inicial
const MAQUINAS_MOCK: Maquina[] = [
    { id: "MAC-001", codigo: "REC-01", tipo: "plana", nombre: "Recta Industrial", modelo: "Juki DDL-8700", serie: "JK-99210", estado: "activa", capacidadPorHora: 50 },
    { id: "MAC-002", codigo: "OVE-01", tipo: "merrow", nombre: "Overlock 5 Hilos", modelo: "Siruba 757K", serie: "SR-11200", estado: "activa", capacidadPorHora: 45 },
    { id: "MAC-003", codigo: "BOR-01", tipo: "cover", nombre: "Bordadora 12 Cabezales", modelo: "Tajima TFMX", serie: "TJ-44500", estado: "inactiva", capacidadPorHora: 20, },
    { id: "MAC-004", codigo: "COR-01", tipo: "corte", nombre: "Cortadora de Tela", modelo: "Eastman 629X", serie: "EM-88122", estado: "depreciada", capacidadPorHora: 100, },
];



const MAQUINAS_ALL_TYPES_MOCK: TipoMaquina[] = ["merrow", "cover", "plana", "corte", "plancha_dtf", "otro"]

const API_LATENCY = 800;

export const maquinasService = {
    getAll: (): Promise<Maquina[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MAQUINAS_MOCK]), API_LATENCY);
        });
    },

    getAllTypes: (): Promise<TipoMaquina[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MAQUINAS_ALL_TYPES_MOCK]), API_LATENCY);
        });
    },

    create: (data: Omit<Maquina, "id">): Promise<Maquina> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const nueva: Maquina = {
                    ...data,
                    id: `MAC-${Math.floor(100 + Math.random() * 900)}`,
                };
                MAQUINAS_MOCK.push(nueva);
                resolve(nueva);
            }, API_LATENCY);
        });
    },

    update: (id: string, data: Partial<Maquina>): Promise<Maquina> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MAQUINAS_MOCK.findIndex((m) => m.id === id);
                if (index === -1) return reject(new Error("Máquina no encontrada"));

                const actualizada = { ...MAQUINAS_MOCK[index], ...data };
                MAQUINAS_MOCK[index] = actualizada;
                resolve(actualizada);
            }, API_LATENCY);
        });
    },
};