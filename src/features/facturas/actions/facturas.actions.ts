"use server";

import { cookies } from "next/headers";
import { facturasService } from "../services/facturas.service";
import { FacturaDetalle } from "@/types";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function fetchFacturasAction(): Promise<FacturaDetalle[]> {
  const token = await getToken();
  return facturasService.getAll(token);
}

export async function procesarFacturaAction(id: string): Promise<FacturaDetalle> {
  const token = await getToken();
  return facturasService.procesar(id, token);
}
