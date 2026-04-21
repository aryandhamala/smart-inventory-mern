import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    listProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    type Product,
} from "../api/products";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuth } from "../auth/AuthContext";

function money(n: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "GBP",
    }).format(n);
}

export function ProductsPage() {
    const { user } = useAuth();
    const isOwner = user?.role === "owner";
    const navigate = useNavigate();

    const [q, setQ] = useState("");
    const [items, setItems] = useState<Product[]>([]);
    const [err, setErr] = useState<string | null>(null);

    const [form, setForm] = useState<Omit<Product, "_id">>({
        sku: "",
        name: "",
        category: "",
        price: 0,
        quantityInStock: 0,
        reorderThreshold: 5,
    });

    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    async function refresh() {
        const data = await listProducts(q);
        setItems(data);
    }

    useEffect(() => {
        refresh().catch((e) => setErr(e.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onSearch() {
        setErr(null);
        try {
            await refresh();
        } catch (e: any) {
            setErr(e.message);
        }
    }

    async function onCreate() {
        setErr(null);
        try {
            await createProduct(form);
            setForm({
                sku: "",
                name: "",
                category: "",
                price: 0,
                quantityInStock: 0,
                reorderThreshold: 5,
            });
            await refresh();
        } catch (e: any) {
            setErr(e.message);
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;

        setDeleteBusy(true);
        setErr(null);

        try {
            await deleteProduct(deleteTarget._id);
            setDeleteTarget(null);
            await refresh();
        } catch (e: any) {
            setErr(e.message || "Failed to delete product");
        } finally {
            setDeleteBusy(false);
        }
    }

    const canEdit = isOwner;

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Products</div>
                <div className="text-sm text-white/60">
                    {isOwner
                        ? "Manage inventory catalogue"
                        : "View catalogue (Owner required for edits)"}
                </div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}

            <GlassCard>
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1">
                        <Input
                            label="Search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by name, SKU, category..."
                        />
                    </div>
                    <Button onClick={onSearch}>Search</Button>
                </div>
            </GlassCard>

            {canEdit && (
                <GlassCard>
                    <div className="font-semibold">Add product</div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <Input
                            label="SKU"
                            value={form.sku}
                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        />
                        <Input
                            label="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <Input
                            label="Category"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                        <Input
                            label="Price"
                            type="number"
                            value={form.price}
                            onChange={(e) =>
                                setForm({ ...form, price: Number(e.target.value) })
                            }
                        />
                        <Input
                            label="Stock"
                            type="number"
                            value={form.quantityInStock}
                            onChange={(e) =>
                                setForm({ ...form, quantityInStock: Number(e.target.value) })
                            }
                        />
                        <Input
                            label="Reorder threshold"
                            type="number"
                            value={form.reorderThreshold}
                            onChange={(e) =>
                                setForm({ ...form, reorderThreshold: Number(e.target.value) })
                            }
                        />
                    </div>
                    <div className="mt-4">
                        <Button onClick={onCreate}>Create</Button>
                    </div>
                </GlassCard>
            )}

            <GlassCard>
                <div className="font-semibold">Catalogue</div>
                <div className="mt-4 divide-y divide-white/10">
                    {items.length === 0 ? (
                        <div className="text-sm text-white/60">No products found.</div>
                    ) : (
                        items.map((p) => (
                            <div
                                key={p._id}
                                className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-xs text-white/50">
                                        {p.sku} · {p.category || "Uncategorised"} · {money(p.price)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-sm">
                                        Stock:{" "}
                                        <b
                                            className={
                                                p.quantityInStock <= p.reorderThreshold
                                                    ? "text-amber-200"
                                                    : ""
                                            }
                                        >
                                            {p.quantityInStock}
                                        </b>
                                    </div>

                                    {canEdit && (
                                        <>
                                            <Button
                                                onClick={async () => {
                                                    const next = Math.max(0, p.quantityInStock + 1);
                                                    await updateProduct(p._id, {
                                                        quantityInStock: next,
                                                    });
                                                    await refresh();
                                                }}
                                            >
                                                +1
                                            </Button>

                                            <Button onClick={() => navigate(`/products/${p._id}/edit`)}>
                                                Edit
                                            </Button>

                                            <Button onClick={() => setDeleteTarget(p)}>Delete</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/90 p-6 shadow-2xl">
                        <div className="text-xl font-bold">Delete Product</div>
                        <div className="mt-3 text-sm text-white/70">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-white">
                                {deleteTarget.name}
                            </span>
                            ? This action cannot be undone.
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleteBusy}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteBusy}
                            >
                                {deleteBusy ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}