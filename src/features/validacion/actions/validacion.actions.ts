"use server";

import { cookies } from "next/headers";
import { validacionService } from "../services/validacion.service";
import { ValidacionReporte } from "../schemas/validacion.schema";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchPendientesAction(): Promise<ValidacionReporte[]> {
  const token = await getToken();
  console.log("[fetchPendientesAction] Token presente:", !!token, token ? `(longitud: ${token.length})` : "(ninguno)");
  return validacionService.getPendientes(token);
}

export async function validarReporteAction(id: string, buenas: number, defectuosas: number, fechaInicio?: string | null, fechaFin?: string | null): Promise<boolean> {
  const token = await getToken();
  return validacionService.validarReporte(id, buenas, defectuosas, fechaInicio, fechaFin, token);
}
