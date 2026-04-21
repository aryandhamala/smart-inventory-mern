import { api } from "./http";
import type { Product } from "./products";

export function summary() {
    return api<{ productCount: number; salesCount: number; totalRevenue: number; lowStockCount: number }>(
        "/analytics/summary"
    );
}

export function lowStock() {
    return api<Product[]>("/analytics/low-stock");
}

export function monthlySales(months = 6) {
    return api<Array<{ year: number; month: number; revenue: number; count: number }>>(
        `/analytics/monthly-sales?months=${months}`
    );
}

export function topProducts(limit = 5) {
    return api<Array<{ productId: string; name: string; sku: string; units: number; revenue: number }>>(
        `/analytics/top-products?limit=${limit}`
    );
}
export function reorderSuggestions(days = 30, leadDays = 7, safetyFactor = 0.2) {
    return api<{
        days: number;
        leadDays: number;
        safetyFactor: number;
        suggestions: Array<{
            productId: string;
            sku: string;
            name: string;
            currentStock: number;
            reorderThreshold: number;
            unitsSoldLastNDays: number;
            avgDailyDemand: number;
            leadDays: number;
            safetyFactor: number;
            targetStock: number;
            suggestedReorderQty: number;
        }>;
    }>(`/analytics/reorder-suggestions?days=${days}&leadDays=${leadDays}&safetyFactor=${safetyFactor}`);
}