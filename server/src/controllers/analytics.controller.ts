import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { Sale } from "../models/Sale";
import { StockMovement } from "../models/StockMovement";


export async function dashboardSummary(_req: Request, res: Response, next: NextFunction) {
    try {
        const [productCount, salesCountAgg, revenueAgg, lowStockCountAgg] = await Promise.all([
            Product.countDocuments(),
            Sale.countDocuments(),
            Sale.aggregate([{ $group: { _id: null, revenue: { $sum: "$totalAmount" } } }]),
            Product.aggregate([
                { $match: { $expr: { $lte: ["$quantityInStock", "$reorderThreshold"] } } },
                { $count: "count" }
            ])
        ]);

        res.json({
            productCount,
            salesCount: salesCountAgg,
            totalRevenue: revenueAgg[0]?.revenue ?? 0,
            lowStockCount: lowStockCountAgg[0]?.count ?? 0
        });
    } catch (e) {
        next(e);
    }
}

export async function lowStockList(_req: Request, res: Response, next: NextFunction) {
    try {
        const items = await Product.find({ $expr: { $lte: ["$quantityInStock", "$reorderThreshold"] } })
            .sort({ quantityInStock: 1 })
            .limit(100);

        res.json(items);
    } catch (e) {
        next(e);
    }
}

export async function monthlySales(req: Request, res: Response, next: NextFunction) {
    try {
        const months = Math.max(1, Math.min(24, Number(req.query.months || 6)));
        const since = new Date();
        since.setMonth(since.getMonth() - months);

        const rows = await Sale.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.y": 1, "_id.m": 1 } }
        ]);

        res.json(rows.map(r => ({
            year: r._id.y,
            month: r._id.m,
            revenue: r.revenue,
            count: r.count
        })));
    } catch (e) {
        next(e);
    }
}

export async function topProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = Math.max(1, Math.min(20, Number(req.query.limit || 5)));

        const rows = await Sale.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    units: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.lineTotal" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }
        ]);

        res.json(rows.map(r => ({
            productId: r._id,
            name: r.product.name,
            sku: r.product.sku,
            units: r.units,
            revenue: r.revenue
        })));
    } catch (e) {
        next(e);
    }
}

export async function reorderSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
        const days = Math.max(7, Math.min(180, Number(req.query.days || 30)));
        const leadDays = Math.max(1, Math.min(60, Number(req.query.leadDays || 7)));
        const safetyFactor = Math.max(0, Math.min(2, Number(req.query.safetyFactor || 0.2))); // 20% default

        const since = new Date();
        since.setDate(since.getDate() - days);

        // Aggregate units sold per product from stock movements (type=sale) in last N days
        const soldAgg = await StockMovement.aggregate([
            { $match: { type: "sale", createdAt: { $gte: since } } },
            { $group: { _id: "$productId", unitsSold: { $sum: "$quantity" } } }
        ]);

        const soldMap = new Map<string, number>(
            soldAgg.map((r) => [String(r._id), Number(r.unitsSold || 0)])
        );

        // Get products
        const products = await Product.find({}).limit(500);

        const suggestions = products
            .map((p) => {
                const unitsSold = soldMap.get(String(p._id)) ?? 0;
                const avgDailyDemand = unitsSold / days;

                // demand during lead time
                const leadDemand = avgDailyDemand * leadDays;

                // simple safety stock: safetyFactor * leadDemand (transparent and explainable)
                const safetyStock = leadDemand * safetyFactor;

                // target stock level = leadDemand + safetyStock
                const target = leadDemand + safetyStock;

                // suggested reorder = target - current stock (rounded up)
                const suggested = Math.max(0, Math.ceil(target - p.quantityInStock));

                return {
                    productId: p._id,
                    sku: p.sku,
                    name: p.name,
                    currentStock: p.quantityInStock,
                    reorderThreshold: p.reorderThreshold,
                    unitsSoldLastNDays: unitsSold,
                    avgDailyDemand: Number(avgDailyDemand.toFixed(3)),
                    leadDays,
                    safetyFactor,
                    targetStock: Number(target.toFixed(2)),
                    suggestedReorderQty: suggested
                };
            })
            // show only meaningful suggestions
            .filter((x) => x.suggestedReorderQty > 0)
            // most urgent first (largest reorder)
            .sort((a, b) => b.suggestedReorderQty - a.suggestedReorderQty)
            .slice(0, 50);

        res.json({ days, leadDays, safetyFactor, suggestions });
    } catch (e) {
        next(e);
    }
}