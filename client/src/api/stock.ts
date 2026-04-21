import { api } from "./http";

export function replenishStock(productId: string, quantity: number, note?: string) {
    return api<{ ok: true }>("/stock/replenish", {
        method: "POST",
        body: JSON.stringify({ productId, quantity, note }),
    });
}