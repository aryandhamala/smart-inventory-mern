import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthedRequest } from "../middleware/auth";
import { saleCreateSchema } from "../validators/sale.validators";
import { Product } from "../models/Product";
import { Sale } from "../models/Sale";
import { StockMovement } from "../models/StockMovement";
import { HttpError } from "../utils/httpError";

export async function createSale(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new HttpError(401, "Unauthorized");
        const data = saleCreateSchema.parse(req.body);

        const performWrite = async (session?: mongoose.ClientSession) => {
            let totalAmount = 0;
            const saleItems: Array<{
                productId: any;
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }> = [];

            for (const item of data.items) {
                const product = session
                    ? await Product.findById(item.productId).session(session)
                    : await Product.findById(item.productId);

                if (!product) throw new HttpError(404, "Product not found");
                if (product.quantityInStock < item.quantity) {
                    throw new HttpError(400, `Insufficient stock for ${product.name}`);
                }

                const unitPrice = product.price;
                const lineTotal = unitPrice * item.quantity;
                totalAmount += lineTotal;

                product.quantityInStock -= item.quantity;
                if (session) await product.save({ session });
                else await product.save();

                saleItems.push({
                    productId: product._id,
                    quantity: item.quantity,
                    unitPrice,
                    lineTotal,
                });

                if (session) {
                    await StockMovement.create(
                        [
                            {
                                productId: product._id,
                                type: "sale",
                                quantity: item.quantity,
                                note: "Sale recorded",
                                createdBy: req.user.userId,
                            },
                        ],
                        { session }
                    );
                } else {
                    await StockMovement.create({
                        productId: product._id,
                        type: "sale",
                        quantity: item.quantity,
                        note: "Sale recorded",
                        createdBy: req.user.userId,
                    });
                }
            }

            let createdSale: any;
            if (session) {
                const docs = await Sale.create(
                    [{ items: saleItems, totalAmount, createdBy: req.user.userId }],
                    { session }
                );
                createdSale = docs[0];
            } else {
                createdSale = await Sale.create({
                    items: saleItems,
                    totalAmount,
                    createdBy: req.user.userId,
                });
            }

            return createdSale;
        };

        const session = await mongoose.startSession();
        try {
            let createdSale: any;

            try {
                await session.withTransaction(async () => {
                    createdSale = await performWrite(session);
                });
            } catch (err: any) {
                const msg = String(err?.message || "");
                if (msg.includes("Transaction numbers are only allowed")) {
                    createdSale = await performWrite(undefined);
                } else {
                    throw err;
                }
            }

            const populatedSale = await Sale.findById(createdSale._id)
                .populate("items.productId", "sku name")
                .lean();

            res.status(201).json({
                ok: true,
                sale: {
                    _id: populatedSale?._id,
                    totalAmount: populatedSale?.totalAmount,
                    createdAt: populatedSale?.createdAt,
                    items: (populatedSale?.items || []).map((item: any) => ({
                        productId: item.productId?._id ?? null,
                        sku: item.productId?.sku ?? "",
                        name: item.productId?.name ?? "",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        lineTotal: item.lineTotal,
                    })),
                },
            });
        } finally {
            session.endSession();
        }
    } catch (e) {
        next(e);
    }
}

export async function mySales(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new HttpError(401, "Unauthorized");

        const sales = await Sale.find({ createdBy: req.user.userId })
            .sort({ createdAt: -1 })
            .populate("items.productId", "sku name")
            .lean();

        const formatted = sales.map((sale: any) => ({
            _id: sale._id,
            totalAmount: sale.totalAmount,
            createdAt: sale.createdAt,
            items: (sale.items || []).map((item: any) => ({
                productId: item.productId?._id ?? null,
                sku: item.productId?.sku ?? "",
                name: item.productId?.name ?? "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
            })),
        }));

        res.json(formatted);
    } catch (e) {
        next(e);
    }
}

export async function allSales(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new HttpError(401, "Unauthorized");

        const sales = await Sale.find({})
            .sort({ createdAt: -1 })
            .populate("items.productId", "sku name")
            .populate("createdBy", "name email role")
            .lean();

        const formatted = sales.map((sale: any) => ({
            _id: sale._id,
            totalAmount: sale.totalAmount,
            createdAt: sale.createdAt,
            createdBy: {
                id: sale.createdBy?._id ?? null,
                name: sale.createdBy?.name ?? "",
                email: sale.createdBy?.email ?? "",
                role: sale.createdBy?.role ?? "",
            },
            items: (sale.items || []).map((item: any) => ({
                productId: item.productId?._id ?? null,
                sku: item.productId?.sku ?? "",
                name: item.productId?.name ?? "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
            })),
        }));

        res.json(formatted);
    } catch (e) {
        next(e);
    }
}
export async function getSaleById(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new HttpError(401, "Unauthorized");

        const sale = await Sale.findById(req.params.id)
            .populate("items.productId", "sku name")
            .populate("createdBy", "name email role")
            .lean();

        if (!sale) throw new HttpError(404, "Sale not found");

        // Staff can only view their own invoices; owner can view all
        const createdById = String((sale as any).createdBy?._id ?? "");
        if (req.user.role !== "owner" && createdById !== req.user.userId) {
            throw new HttpError(403, "Forbidden");
        }

        res.json({
            _id: sale._id,
            totalAmount: sale.totalAmount,
            createdAt: sale.createdAt,
            createdBy: {
                id: (sale as any).createdBy?._id ?? null,
                name: (sale as any).createdBy?.name ?? "",
                email: (sale as any).createdBy?.email ?? "",
                role: (sale as any).createdBy?.role ?? "",
            },
            items: (sale.items || []).map((item: any) => ({
                productId: item.productId?._id ?? null,
                sku: item.productId?.sku ?? "",
                name: item.productId?.name ?? "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
            })),
        });
    } catch (e) {
        next(e);
    }
}