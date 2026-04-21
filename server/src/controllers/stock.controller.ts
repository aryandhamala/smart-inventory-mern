import { Response, NextFunction } from "express";
import { AuthedRequest } from "../middleware/auth";
import { replenishSchema } from "../validators/stock.validators";
import { Product } from "../models/Product";
import { StockMovement } from "../models/StockMovement";
import { HttpError } from "../utils/httpError";

export async function replenishStock(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new HttpError(401, "Unauthorized");

        const data = replenishSchema.parse(req.body);

        const product = await Product.findById(data.productId);
        if (!product) throw new HttpError(404, "Product not found");

        product.quantityInStock += data.quantity;
        await product.save();

        await StockMovement.create({
            productId: product._id,
            type: "replenish",
            quantity: data.quantity,
            note: data.note || "Replenishment",
            createdBy: req.user.userId,
        });

        res.status(201).json({ ok: true });
    } catch (e) {
        next(e);
    }
}