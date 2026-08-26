"use server";

import { cookies } from "next/headers";
import { ordenesVentaService } from "../services/ordenes-venta.service";
import { OrdenVenta } from "@/types";
import { OrdenVentaFormData } from "../schemas/ordenes-venta.schemas";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchOrdenesVentaAction(): Promise<OrdenVenta[]> {
  const token = await getToken();
  return ordenesVentaService.getAll(token);
}

export async function createOrdenVentaAction(data: OrdenVentaFormData): Promise<OrdenVenta> {
  const token = await getToken();
  return ordenesVentaService.create(data, token);
}

export async function updateOrdenVentaAction(id: string, data: Partial<OrdenVentaFormData>): Promise<OrdenVenta> {
  const token = await getToken();
  return ordenesVentaService.update(id, data, token);
}

export async function deleteOrdenVentaAction(id: string): Promise<boolean> {
  const token = await getToken();
  return ordenesVentaService.delete(id, token);
}

export async function generarFacturaAction(id: string): Promise<any> {
  const token = await getToken();
  return ordenesVentaService.generarFactura(id, token);
}
