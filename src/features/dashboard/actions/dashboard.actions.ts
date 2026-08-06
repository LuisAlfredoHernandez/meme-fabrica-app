"use server";

import { cookies } from "next/headers";
import { dashboardService, DashboardStatsResponse } from "../services/dashboard.service";

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value;
}

export async function getDashboardStatsAction(): Promise<DashboardStatsResponse> {
    const token = await getToken();
    return dashboardService.getStats(token);
}
