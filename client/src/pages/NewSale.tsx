import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts, type Product } from "../api/products";
import { createSale } from "../api/sales";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

type Cart = Record<string, number>;

type Receipt = {
    _id: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{
        productId: string | null;
        sku: string;
        name: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
    }>;
};

function money(n: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "GBP",
    }).format(n);
}

function formatDate(d: string) {
    return new Date(d).toLocaleString();
}

export function NewSalePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [q, setQ] = useState("");
    const [cart, setCart] = useState<Cart>({});
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    async function refresh(search = q) {
        const data = await listProducts(search);
        setProducts(data);
    }

    useEffect(() => {
        refresh().catch((e) => setErr(e.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cartItems = useMemo(() => {
        return Object.entries(cart)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const p = products.find((x) => x._id === id);
                return p ? { product: p, qty } : null;
            })
            .filter(Boolean) as Array<{ product: Product; qty: number }>;
    }, [cart, products]);

    const total = useMemo(() => {
        return cartItems.reduce((sum, it) => sum + it.qty * it.product.price, 0);
    }, [cartItems]);

    function addToCart(p: Product) {
        setCart((c) => ({ ...c, [p._id]: (c[p._id] ?? 0) + 1 }));
    }

    function setQty(id: string, qty: number) {
        setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));
    }

    async function search() {
        setErr(null);
        try {
            await refresh(q);
        } catch (e: any) {
            setErr(e.message);
        }
    }

    async function submitSale() {
        setErr(null);
        setOk(null);
        setBusy(true);
        try {
            const items = cartItems.map((it) => ({
                productId: it.product._id,
                quantity: it.qty,
            }));

            const res = await createSale(items);

            setOk("Sale recorded successfully. Stock updated.");
            setReceipt(res.sale);
            setCart({});
            await refresh();
        } catch (e: any) {
            setErr(e.message || "Failed to record sale");
        } finally {
            setBusy(false);
        }
    }

    function newTransaction() {
        setReceipt(null);
        setOk(null);
        setErr(null);
        setCart({});
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">POS – New Sale</div>
                <div className="text-sm text-white/60">
                    Search products, add to cart, submit sale
                </div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}
            {ok && <GlassPanel className="border-emerald-400/30">{ok}</GlassPanel>}

            {receipt && (
                <GlassCard>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="text-lg font-bold">Receipt</div>
                            <div className="text-xs text-white/50">
                                Sale #{receipt._id.slice(-6)} · {formatDate(receipt.createdAt)}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link to={`/sales/${receipt._id}/invoice`}>
                                <Button type="button">View Invoice</Button>
                            </Link>
                            <Button onClick={newTransaction}>New Transaction</Button>
                        </div>
                    </div>

                    <div className="mt-4 divide-y divide-white/10">
                        {receipt.items.map((item, idx) => (
                            <div
                                key={`${receipt._id}-${idx}`}
                                className="flex items-center justify-between py-3"
                            >
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-white/50">
                                        {item.sku} · Qty: {item.quantity} · Unit: {money(item.unitPrice)}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold">
                                    {money(item.lineTotal)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <div className="text-sm text-white/60">Total</div>
                        <div className="text-xl font-bold">{money(receipt.totalAmount)}</div>
                    </div>
                </GlassCard>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <GlassCard>
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="flex-1">
                                <Input
                                    label="Search products"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Name / SKU / category"
                                />
                            </div>
                            <Button onClick={search}>Search</Button>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="font-semibold">Products</div>
                        <div className="mt-4 grid gap-3">
                            {products.map((p) => (
                                <div
                                    key={p._id}
                                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                                >
                                    <div>
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-white/50">
                                            {p.sku} · {money(p.price)} · Stock: {p.quantityInStock}
                                        </div>
                                    </div>
                                    <Button
                                        disabled={p.quantityInStock <= 0}
                                        onClick={() => addToCart(p)}
                                    >
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-4">
                    <GlassCard>
                        <div className="flex items-center justify-between">
                            <div className="font-semibold">Cart</div>
                            <div className="text-sm font-bold">{money(total)}</div>
                        </div>

                        <div className="mt-4 divide-y divide-white/10">
                            {cartItems.length === 0 ? (
                                <div className="text-sm text-white/60">No items yet.</div>
                            ) : (
                                cartItems.map(({ product, qty }) => {
                                    const overStock = qty > product.quantityInStock;
                                    return (
                                        <div
                                            key={product._id}
                                            className="py-3 flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{product.name}</div>
                                                <div className="text-xs text-white/50">
                                                    {product.sku} · {money(product.price)}
                                                </div>
                                                {overStock && (
                                                    <div className="text-xs text-amber-200">
                                                        Qty exceeds available stock ({product.quantityInStock})
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button onClick={() => setQty(product._id, qty - 1)}>-</Button>
                                                <input
                                                    className="w-16 rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-center outline-none"
                                                    type="number"
                                                    min={0}
                                                    value={qty}
                                                    onChange={(e) => setQty(product._id, Number(e.target.value))}
                                                />
                                                <Button onClick={() => setQty(product._id, qty + 1)}>+</Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-4 border-t border-white/10 pt-4">
                            <div className="mb-3 flex items-center justify-between text-sm">
                                <span className="text-white/60">Items</span>
                                <span>{cartItems.length}</span>
                            </div>
                            <div className="mb-4 flex items-center justify-between text-sm">
                                <span className="text-white/60">Total</span>
                                <span className="font-bold">{money(total)}</span>
                            </div>

                            <Button
                                className="w-full"
                                disabled={
                                    busy ||
                                    cartItems.length === 0 ||
                                    cartItems.some((it) => it.qty > it.product.quantityInStock)
                                }
                                onClick={submitSale}
                            >
                                {busy ? "Submitting..." : "Submit Sale"}
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}