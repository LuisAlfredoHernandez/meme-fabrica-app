"use server";

import { cookies } from "next/headers";
import { operariosService } from "@/features/operarios/services/operarios.service";
import type { Operario } from "@/types";

/**
 * Obtiene el token de manera segura en el servidor.
 */
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchOperariosAction(): Promise<Operario[]> {
  const token = await getToken();
  return operariosService.getAll(token);
}

export async function createOperarioAction(data: Omit<Operario, "id">): Promise<Operario> {
  const token = await getToken();
  return operariosService.create(data, token);
}

export async function updateOperarioAction(id: string, data: Partial<Operario>): Promise<Operario> {
  const token = await getToken();
  return operariosService.update(id, data, token);
}

export async function deleteOperarioAction(id: string): Promise<boolean> {
  const token = await getToken();
  return operariosService.delete(id, token);
}

export async function getOperarioByIdAction(id: string): Promise<Operario | undefined> {
  const token = await getToken();
  return operariosService.getById(id, token);
}

export async function iniciarSesionOperarioAction(): Promise<Operario> {
  const token = await getToken();
  return operariosService.iniciarSesion(token);
}
