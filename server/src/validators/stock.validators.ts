import { z } from "zod";

export const replenishSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    note: z.string().optional().default("Replenishment"),
});