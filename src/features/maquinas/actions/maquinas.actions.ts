"use server";

import { cookies } from "next/headers";
import { maquinasService } from "@/features/maquinas/services/maquinas.service";
import { Maquina, TipoMaquina, ReporteAveria } from "@/types";

import { unstable_noStore as noStore } from "next/cache";

/**
 * Obtiene el token de manera segura en el servidor.
 */
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchMaquinasAction(): Promise<Maquina[]> {
  noStore();
  const token = await getToken();
  return maquinasService.getAll(token);
}

export async function fetchAllMaquinaTypesAction(): Promise<TipoMaquina[]> {
  noStore();
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

export async function reportarAveriaAction(data: Omit<ReporteAveria, "id" | "fecha_reporte" | "estado">): Promise<ReporteAveria> {
  const token = await getToken();
  return maquinasService.reportarAveria(data, token);
}

export async function fetchReportesAveriaPendientesAction(): Promise<ReporteAveria[]> {
  noStore();
  const token = await getToken();
  return maquinasService.getReportesAveriaPendientes(token);
}

export async function procesarReporteAveriaAction(id: string, aprobado: boolean, notas?: string, nuevaMaquinaId?: string): Promise<ReporteAveria> {
  const token = await getToken();
  return maquinasService.procesarReporteAveria(id, aprobado, notas, nuevaMaquinaId, token);
}
