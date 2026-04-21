import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import { Product } from "../models/Product";
import { Sale } from "../models/Sale";

function sendCsv(res: Response, filename: string, csv: string) {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
}

export async function exportProductsCsv(_req: Request, res: Response, next: NextFunction) {
    try {
        const products = await Product.find({}).sort({ updatedAt: -1 }).lean();

        const fields = [
            { label: "SKU", value: "sku" },
            { label: "Name", value: "name" },
            { label: "Category", value: "category" },
            { label: "Price", value: "price" },
            { label: "QuantityInStock", value: "quantityInStock" },
            { label: "ReorderThreshold", value: "reorderThreshold" },
            { label: "CreatedAt", value: "createdAt" },
            { label: "UpdatedAt", value: "updatedAt" },
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(products);

        sendCsv(res, "products.csv", csv);
    } catch (e) {
        next(e);
    }
}

export async function exportSalesCsv(_req: Request, res: Response, next: NextFunction) {
    try {
        // populate product to get sku/name in rows
        const sales = await Sale.find({})
            .sort({ createdAt: -1 })
            .populate("items.productId", "sku name")
            .populate("createdBy", "email role")
            .lean();

        // Flatten: one row per sale item (best for CSV analysis)
        const rows: any[] = [];
        for (const s of sales) {
            for (const it of s.items || []) {
                const p: any = it.productId;
                rows.push({
                    saleId: String(s._id),
                    saleDate: s.createdAt,
                    createdByEmail: (s as any).createdBy?.email ?? "",
                    createdByRole: (s as any).createdBy?.role ?? "",
                    productSku: p?.sku ?? "",
                    productName: p?.name ?? "",
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    lineTotal: it.lineTotal,
                    saleTotalAmount: s.totalAmount,
                });
            }
        }

        const fields = [
            { label: "SaleID", value: "saleId" },
            { label: "SaleDate", value: "saleDate" },
            { label: "CreatedByEmail", value: "createdByEmail" },
            { label: "CreatedByRole", value: "createdByRole" },
            { label: "ProductSKU", value: "productSku" },
            { label: "ProductName", value: "productName" },
            { label: "Quantity", value: "quantity" },
            { label: "UnitPrice", value: "unitPrice" },
            { label: "LineTotal", value: "lineTotal" },
            { label: "SaleTotalAmount", value: "saleTotalAmount" },
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(rows);

        sendCsv(res, "sales.csv", csv);
    } catch (e) {
        next(e);
    }
}