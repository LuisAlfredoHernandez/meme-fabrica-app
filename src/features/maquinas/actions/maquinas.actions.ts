"use server";

import { cookies } from "next/headers";
import { maquinasService } from "@/features/maquinas/services/maquinas.service";
import { Maquina, TipoMaquina } from "@/types";

/**
 * Obtiene el token de manera segura en el servidor.
 */
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchMaquinasAction(): Promise<Maquina[]> {
  const token = await getToken();
  return maquinasService.getAll(token);
}

export async function fetchAllMaquinaTypesAction(): Promise<TipoMaquina[]> {
  const token = await getToken();
  return maquinasService.getAllTypes(token);
}

export async function createMaquinaAction(data: Omit<Maquina, "id">): Promise<Maquina> {
  const token = await getToken();
  return maquinasService.create(data, token);
}

export async function updateMaquinaAction(id: string, data: Partial<Maquina>): Promise<Maquina> {
  const token = await getToken();
  return maquinasService.update(id, data, token);
}
