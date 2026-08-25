"use server";

import { cookies } from "next/headers";
import { ordenesCompraService } from "../services/ordenes-compra.service";
import { OrdenCompra } from "@/types";
import { OrdenCompraFormData } from "../schemas/ordenes-compra.schemas";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchOrdenesCompraAction(): Promise<OrdenCompra[]> {
  const token = await getToken();
  return ordenesCompraService.getAll(token);
}

export async function createOrdenCompraAction(data: OrdenCompraFormData): Promise<OrdenCompra> {
  const token = await getToken();
  return ordenesCompraService.create(data, token);
}

export async function updateOrdenCompraAction(id: string, data: Partial<OrdenCompraFormData>): Promise<OrdenCompra> {
  const token = await getToken();
  return ordenesCompraService.update(id, data, token);
}

export async function deleteOrdenCompraAction(id: string): Promise<boolean> {
  const token = await getToken();
  return ordenesCompraService.delete(id, token);
}

export async function recibirOrdenCompraAction(id: string): Promise<OrdenCompra> {
  const token = await getToken();
  return ordenesCompraService.recibir(id, token);
}
