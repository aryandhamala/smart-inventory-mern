import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { allSales } from "../api/sales";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

function money(n: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "GBP",
    }).format(n);
}

function formatDate(d: string) {
    return new Date(d).toLocaleString();
}

export function AllSalesHistoryPage() {
    const [sales, setSales] = useState<
        Array<{
            _id: string;
            totalAmount: number;
            createdAt: string;
            createdBy: {
                id: string | null;
                name: string;
                email: string;
                role: string;
            };
            items: Array<{
                productId: string | null;
                sku: string;
                name: string;
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }>;
        }>
    >([]);
    const [query, setQuery] = useState("");
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        allSales()
            .then(setSales)
            .catch((e) => setErr(e.message || "Failed to load sales history"));
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sales;

        return sales.filter((sale) => {
            const createdByMatch =
                sale.createdBy.name.toLowerCase().includes(q) ||
                sale.createdBy.email.toLowerCase().includes(q);

            const itemMatch = sale.items.some(
                (item) =>
                    item.name.toLowerCase().includes(q) ||
                    item.sku.toLowerCase().includes(q)
            );

            return createdByMatch || itemMatch || sale._id.toLowerCase().includes(q);
        });
    }, [sales, query]);

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">All Sales History</div>
                <div className="text-sm text-white/60">
                    Owner view of all recorded sales across staff and owner accounts
                </div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}

            <GlassCard>
                <Input
                    label="Search by staff name, email, SKU, product name, or sale ID"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search sales..."
                />
            </GlassCard>

            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <GlassCard>
                        <div className="text-sm text-white/60">No matching sales found.</div>
                    </GlassCard>
                ) : (
                    filtered.map((sale) => (
                        <GlassCard key={sale._id}>
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="font-semibold">Sale #{sale._id.slice(-6)}</div>
                                    <div className="text-xs text-white/50">
                                        {formatDate(sale.createdAt)}
                                    </div>
                                    <div className="mt-1 text-xs text-white/50">
                                        Recorded by: {sale.createdBy.name} ({sale.createdBy.email}) ·{" "}
                                        {sale.createdBy.role}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-sm font-bold">{money(sale.totalAmount)}</div>
                                    <Link to={`/sales/${sale._id}/invoice`}>
                                        <Button type="button">View Invoice</Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-4 divide-y divide-white/10">
                                {sale.items.map((item, idx) => (
                                    <div
                                        key={`${sale._id}-${idx}`}
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
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}