import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { productCreateSchema, productUpdateSchema } from "../validators/product.validators";
import { HttpError } from "../utils/httpError";

export async function listProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const q = String(req.query.q || "").trim();
        const filter = q ? { $text: { $search: q } } : {};
        const products = await Product.find(filter).sort({ updatedAt: -1 }).limit(200);
        res.json(products);
    } catch (e) {
        next(e);
    }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const p = await Product.findById(req.params.id);
        if (!p) throw new HttpError(404, "Product not found");
        res.json(p);
    } catch (e) {
        next(e);
    }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const data = productCreateSchema.parse(req.body);
        const created = await Product.create(data);
        res.status(201).json(created);
    } catch (e) {
        next(e);
    }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const data = productUpdateSchema.parse(req.body);
        const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!updated) throw new HttpError(404, "Product not found");
        res.json(updated);
    } catch (e) {
        next(e);
    }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) throw new HttpError(404, "Product not found");
        res.json({ ok: true });
    } catch (e) {
        next(e);
    }
}