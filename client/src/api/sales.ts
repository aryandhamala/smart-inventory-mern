import { api } from "./http";

export type SaleLine = {
    productId: string | null;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

export type SaleRecord = {
    _id: string;
    totalAmount: number;
    createdAt: string;
    items: SaleLine[];
};

export type SaleRecordWithUser = {
    _id: string;
    totalAmount: number;
    createdAt: string;
    createdBy: {
        id: string | null;
        name: string;
        email: string;
        role: string;
    };
    items: SaleLine[];
};

export function createSale(items: Array<{ productId: string; quantity: number }>) {
    return api<{
        ok: true;
        sale: SaleRecord;
    }>("/sales", {
        method: "POST",
        body: JSON.stringify({ items }),
    });
}

export function mySales() {
    return api<SaleRecord[]>("/sales/mine");
}

export function allSales() {
    return api<SaleRecordWithUser[]>("/sales/all");
}

export function getSaleById(id: string) {
    return api<SaleRecordWithUser>(`/sales/${id}`);
}