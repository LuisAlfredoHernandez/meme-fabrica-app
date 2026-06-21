"use server";

import { cookies } from "next/headers";
import { ordenesService } from "@/features/ordenes/services/ordenes.service";
import type { Orden } from "@/types";

/**
 * Helper to retrieve the active user token securely on the server.
 */
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchOrdenesAction(): Promise<Orden[]> {
  const token = await getToken();
  return ordenesService.getAll(token);
}

export async function createOrdenAction(data: Omit<Orden, "id">): Promise<Orden> {
  const token = await getToken();
  return ordenesService.create(data, token);
}

export async function updateOrdenAction(id: string, data: Partial<Orden>): Promise<Orden> {
  const token = await getToken();
  return ordenesService.update(id, data, token);
}

export async function deleteOrdenAction(id: string): Promise<boolean> {
  const token = await getToken();
  return ordenesService.delete(id, token);
}

export async function getOrdenByIdAction(id: string): Promise<Orden | undefined> {
  const token = await getToken();
  return ordenesService.getById(id, token);
}
