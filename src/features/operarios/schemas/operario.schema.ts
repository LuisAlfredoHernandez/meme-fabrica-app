import { z } from "zod";


export const MAQUINAS_VALUES = [
  "merrow",
  "cover",
  "plana",
  "corte",
  "peso",
  "plancha_dtf",
] as const;


// Si ya tienes los tipos definidos, intenta que coincidan
const operarioSchema = z.object({
    nombre: z.string().min(2, "El nombre es demasiado corto"),
    apellido: z.string().min(2, "El apellido es demasiado corto"),
    estado: z.enum(["activo", "inactivo"] as const),
    rol: z.enum(["operario", "admin", "supervisor"] as const), // Ajusta según tus tipos
    habilidades: z.array(
        z.object({
            maquina: MAQUINAS_VALUES, // Aquí podrías usar z.enum si tienes los nombres fijos
            nivelEficiencia: z.number().min(0).max(100).default(0),
        })
    ).min(1, "Selecciona al menos una máquina"),
});

// Esto genera el tipo automáticamente a partir del esquema
type OperarioFormData = z.infer<typeof operarioSchema>;