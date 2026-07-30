"use server";

import { cookies } from "next/headers";
import { asignacionesService } from "@/features/operarios/services/asignaciones.service";
import type { AsignacionOrden } from "@/types";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchAsignacionesAction(): Promise<AsignacionOrden[]> {
  const token = await getToken();
  return asignacionesService.getAll(token);
}

export async function createAsignacionAction(data: Omit<AsignacionOrden, "id" | "fecha_asignacion">): Promise<AsignacionOrden> {
  const token = await getToken();
  return asignacionesService.create(data, token);
}

export async function updateAsignacionAction(id: string, data: Partial<AsignacionOrden>): Promise<AsignacionOrden> {
  const token = await getToken();
  return asignacionesService.update(id, data, token);
}

export async function deleteAsignacionAction(id: string): Promise<boolean> {
  const token = await getToken();
  return asignacionesService.delete(id, token);
}

export async function reportarAvanceAction(data: { asignacion_id: string; piezas_reportadas: number; piezas_buenas?: number; piezas_defectuosas?: number; maquina_id?: string; notas?: string; fecha_inicio?: string; fecha_fin?: string }): Promise<any> {
  const token = await getToken();
  return asignacionesService.reportarAvance(data, token);
}
