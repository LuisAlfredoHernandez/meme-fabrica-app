import { z } from "zod";

export const lineaOrdenVentaSchema = z.object({
  id: z.string().optional(),
  prenda_id: z.string().optional(),
  descripcion: z.string().min(2, "Debe especificar la prenda"),
  talla: z.string().min(1, "La talla es obligatoria"),
  color: z.string().optional(),
  cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
  precio_unitario: z.number().min(0, "El precio no puede ser negativo"),
});

export const ordenVentaSchema = z.object({
  id: z.string().optional(),
  numero: z.string().optional(),
  cliente: z.string().min(2, "El nombre del cliente es obligatorio"),
  estado: z.enum(["EN_ESPERA", "EN_PRODUCCION", "COMPLETADA", "FACTURADA", "CANCELADA"]).optional(),
  prioridad: z.enum(["baja", "normal", "alta", "urgente"]),
  fecha_entrega_estimada: z.string().min(10, "La fecha de entrega es obligatoria"),
  notas: z.string().optional(),
  lineas: z.array(lineaOrdenVentaSchema).min(1, "Debe incluir al menos una línea"),
});

export type OrdenVentaFormData = z.infer<typeof ordenVentaSchema>;
export type LineaOrdenVentaFormData = z.infer<typeof lineaOrdenVentaSchema>;
