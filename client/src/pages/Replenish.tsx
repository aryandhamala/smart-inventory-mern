import React, { useEffect, useMemo, useState } from "react";
import { listProducts, type Product } from "../api/products";
import { replenishStock } from "../api/stock";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export function ReplenishPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [productId, setProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [note, setNote] = useState<string>("Replenishment");
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        listProducts("")
            .then((p) => {
                setProducts(p);
                if (p[0]?._id) setProductId(p[0]._id);
            })
            .catch((e) => setErr(e.message));
    }, []);

    const selected = useMemo(() => products.find((p) => p._id === productId), [products, productId]);

    async function submit() {
        setErr(null);
        setOk(null);
        setBusy(true);
        try {
            await replenishStock(productId, quantity, note);
            setOk("Stock replenished successfully.");
            // refresh products to show updated stock
            const updated = await listProducts("");
            setProducts(updated);
        } catch (e: any) {
            setErr(e.message || "Failed to replenish stock");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Replenish Stock</div>
                <div className="text-sm text-white/60">Owner-only stock increase with audit trail</div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}
            {ok && <GlassPanel className="border-emerald-400/30">{ok}</GlassPanel>}

            <GlassCard>
                <div className="grid gap-4 md:grid-cols-3">
                    <label className="block space-y-1 md:col-span-1">
                        <div className="text-xs text-white/70">Product</div>
                        <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/30 focus:bg-white/10 transition"
                        >
                            {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name} ({p.sku})
                                </option>
                            ))}
                        </select>
                    </label>

                    <Input
                        label="Quantity"
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />

                    <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />

                    <div className="md:col-span-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div>
                            <div className="text-sm font-semibold">{selected?.name ?? "—"}</div>
                            <div className="text-xs text-white/60">
                                Current stock: <b>{selected?.quantityInStock ?? "—"}</b> · Threshold: {selected?.reorderThreshold ?? "—"}
                            </div>
                        </div>

                        <Button disabled={busy || !productId || quantity <= 0} onClick={submit}>
                            {busy ? "Saving..." : "Replenish"}
                        </Button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}