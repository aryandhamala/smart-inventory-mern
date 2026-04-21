import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mySales } from "../api/sales";
import { GlassCard, GlassPanel } from "../components/Glass";
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

export function SalesHistoryPage() {
    const [sales, setSales] = useState<
        Array<{
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
        }>
    >([]);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        mySales()
            .then(setSales)
            .catch((e) => setErr(e.message || "Failed to load sales history"));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Sales History</div>
                <div className="text-sm text-white/60">
                    View recorded sales and line items
                </div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}

            <div className="space-y-4">
                {sales.length === 0 ? (
                    <GlassCard>
                        <div className="text-sm text-white/60">No sales recorded yet.</div>
                    </GlassCard>
                ) : (
                    sales.map((sale) => (
                        <GlassCard key={sale._id}>
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="font-semibold">Sale #{sale._id.slice(-6)}</div>
                                    <div className="text-xs text-white/50">
                                        {formatDate(sale.createdAt)}
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