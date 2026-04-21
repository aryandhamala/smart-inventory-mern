import { z } from "zod";

export const saleCreateSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string().min(1),
            quantity: z.number().int().positive()
        })
    ).min(1)
});