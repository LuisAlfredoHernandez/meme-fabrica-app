import { z } from "zod";

export const lineaOrdenCompraSchema = z.object({
  id: z.string().optional(),
  insumo_id: z.string().uuid("Debe seleccionar un insumo válido"),
  cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
  precio_unitario: z.number().min(0, "El precio no puede ser negativo"),
});

export const ordenCompraSchema = z.object({
  id: z.string().optional(),
  numero: z.string().optional(),
  proveedor: z.string().min(2, "El nombre del proveedor es obligatorio"),
  estado: z.enum(["PENDIENTE", "RECIBIDA", "CANCELADA"]).optional(),
  notas: z.string().optional(),
  lineas: z.array(lineaOrdenCompraSchema).min(1, "Debe incluir al menos un insumo"),
});

export type OrdenCompraFormData = z.infer<typeof ordenCompraSchema>;
export type LineaOrdenCompraFormData = z.infer<typeof lineaOrdenCompraSchema>;
