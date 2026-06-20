"use server";

import { cookies } from "next/headers";
import { insumosService } from "@/features/insumos/services/insumos.service";
import type { Insumo } from "@/types";

/**
 * Obtiene el token de manera segura en el servidor.
 */
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchInsumosAction(): Promise<Insumo[]> {
  const token = await getToken();
  return insumosService.getAll(token);
}

export async function createInsumoAction(data: Omit<Insumo, "id">): Promise<Insumo> {
  const token = await getToken();
  return insumosService.create(data, token);
}

export async function updateInsumoAction(id: string, data: Partial<Insumo>): Promise<Insumo> {
  const token = await getToken();
  return insumosService.update(id, data, token);
}

export async function deleteInsumoAction(id: string): Promise<boolean> {
  const token = await getToken();
  return insumosService.delete(id, token);
}

export async function getInsumoByIdAction(id: string): Promise<Insumo | undefined> {
  const token = await getToken();
  return insumosService.getById(id, token);
}
