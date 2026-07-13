"use server";

import { cookies } from "next/headers";
import { iaService } from "../services/ia.service";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function getProjectionsAction(): Promise<any[]> {
  const token = await getToken();
  return iaService.getProjections(token);
}

export async function getBottlenecksAction(): Promise<{ cuellos: any[]; recomendaciones: any[] }> {
  const token = await getToken();
  return iaService.getBottlenecks(token);
}

export async function simulateMtsAction(cantidad: number): Promise<any[]> {
  const token = await getToken();
  return iaService.simulateMts(cantidad, token);
}

export async function trainModelAction(): Promise<any> {
  const token = await getToken();
  return iaService.trainModel(token);
}

export async function seedDataAction(): Promise<any> {
  const token = await getToken();
  return iaService.seedData(token);
}

export async function uploadTrainDataAction(formData: FormData): Promise<any> {
  const token = await getToken();
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No se proporcionó ningún archivo.");
  }
  return iaService.uploadTrainData(file, token);
}

export async function getIaStatusAction() {
  const token = await getToken();
  return iaService.getIaStatus(token);
}

export async function predictDeliveryTimeAction(
  cantidadPiezas: number,
  prioridadAlta: boolean,
  lineasProduccion: number,
  tipoPrenda: string
) {
  const token = await getToken();
  return iaService.predictDeliveryTime(cantidadPiezas, prioridadAlta, lineasProduccion, tipoPrenda, token);
}

export async function exportHistoryAction(): Promise<string> {
  const token = await getToken();
  const response = await iaService.exportHistory(token);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}


