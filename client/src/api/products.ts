import { api } from "./http";

export type Product = {
    _id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    quantityInStock: number;
    reorderThreshold: number;
};

export function listProducts(q = "") {
    const qp = q ? `?q=${encodeURIComponent(q)}` : "";
    return api<Product[]>(`/products${qp}`);
}

export function createProduct(p: Omit<Product, "_id">) {
    return api<Product>("/products", { method: "POST", body: JSON.stringify(p) });
}

export function updateProduct(id: string, patch: Partial<Omit<Product, "_id">>) {
    return api<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteProduct(id: string) {
    return api<{ ok: true }>(`/products/${id}`, { method: "DELETE" });
}