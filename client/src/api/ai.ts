import { api } from "./http";

export function forecastDemand(store: number, item: number, days = 7) {
    return api<{
        store: number;
        item: number;
        days: number;
        predictedDemand: number;
        dailyForecast: number[];
        currentStock: number;
        suggestedReorder: number;
        stockRisk: "LOW" | "MEDIUM" | "HIGH";
    }>(`/ai/forecast?store=${store}&item=${item}&days=${days}`);
}