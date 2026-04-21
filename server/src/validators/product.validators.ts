import { z } from "zod";

export const productCreateSchema = z.object({
    sku: z.string().min(2),
    name: z.string().min(2),
    category: z.string().optional().default(""),
    price: z.number().nonnegative(),
    quantityInStock: z.number().int().nonnegative(),
    reorderThreshold: z.number().int().nonnegative().optional().default(5)
});

export const productUpdateSchema = productCreateSchema.partial();