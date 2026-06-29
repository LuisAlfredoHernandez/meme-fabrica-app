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
