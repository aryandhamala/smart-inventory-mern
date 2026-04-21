import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    monthlySales,
    reorderSuggestions,
    summary,
    topProducts,
} from "../api/analytics";
import { listProducts, type Product } from "../api/products";
import { mySales } from "../api/sales";
import { StatCard } from "../components/StatCard";
import { GlassCard, GlassPanel } from "../components/Glass";
import { useAuth } from "../auth/AuthContext";
import { MonthlySalesChart } from "../components/MonthlySalesChart";
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

export function DashboardPage() {
    const { user } = useAuth();
    const isOwner = user?.role === "owner";

    const [ownerSummary, setOwnerSummary] = useState<{
        productCount: number;
        salesCount: number;
        totalRevenue: number;
        lowStockCount: number;
    } | null>(null);

    const [top, setTop] = useState<
        Array<{ name: string; sku: string; units: number; revenue: number }>
    >([]);

    const [series, setSeries] = useState<
        Array<{ year: number; month: number; revenue: number; count: number }>
    >([]);

    const [reorder, setReorder] = useState<
        Array<{
            sku: string;
            name: string;
            currentStock: number;
            suggestedReorderQty: number;
        }>
    >([]);

    const [staffProducts, setStaffProducts] = useState<Product[]>([]);
    const [staffSales, setStaffSales] = useState<
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
        (async () => {
            setErr(null);
            try {
                if (isOwner) {
                    const [s1, t, ms, rs] = await Promise.all([
                        summary(),
                        topProducts(5),
                        monthlySales(6),
                        reorderSuggestions(30, 7, 0.2),
                    ]);

                    setOwnerSummary(s1);
                    setTop(t);
                    setSeries(ms);
                    setReorder(
                        rs.suggestions.slice(0, 5).map((x) => ({
                            sku: x.sku,
                            name: x.name,
                            currentStock: x.currentStock,
                            suggestedReorderQty: x.suggestedReorderQty,
                        }))
                    );
                } else {
                    const [products, sales] = await Promise.all([
                        listProducts(""),
                        mySales(),
                    ]);
                    setStaffProducts(products);
                    setStaffSales(sales);
                }
            } catch (e: any) {
                setErr(e.message || "Failed to load dashboard");
            }
        })();
    }, [isOwner]);

    const ownerRevenueFmt = useMemo(() => {
        const n = ownerSummary?.totalRevenue ?? 0;
        return money(n);
    }, [ownerSummary]);

    const staffTotalSalesValue = useMemo(() => {
        return staffSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    }, [staffSales]);

    const staffTotalUnitsSold = useMemo(() => {
        return staffSales.reduce(
            (sum, sale) =>
                sum +
                sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
            0
        );
    }, [staffSales]);

    const recentStaffSales = useMemo(() => {
        return staffSales.slice(0, 5);
    }, [staffSales]);

    if (isOwner) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="text-2xl font-bold tracking-tight">Owner Dashboard</div>
                    <div className="text-sm text-white/60">KPIs and quick insights</div>
                </div>

                {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}

                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                        label="Products"
                        value={String(ownerSummary?.productCount ?? "—")}
                    />
                    <StatCard
                        label="Sales"
                        value={String(ownerSummary?.salesCount ?? "—")}
                    />
                    <StatCard label="Revenue" value={ownerSummary ? ownerRevenueFmt : "—"} />
                    <StatCard
                        label="Low stock"
                        value={String(ownerSummary?.lowStockCount ?? "—")}
                    />
                </div>

                <GlassCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-semibold">AI Forecast Module</div>
                            <div className="mt-1 text-xs text-white/50">
                                Machine learning demand forecasting trained using a Kaggle retail
                                demand forecasting dataset
                            </div>
                        </div>

                        <Link to="/ai/forecast">
                            <Button>Open AI Forecast</Button>
                        </Link>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="text-sm font-semibold">Forecast demand</div>
                            <div className="mt-1 text-xs text-white/60">
                                Predict future demand for selected store and item IDs over a chosen
                                forecast horizon.
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="text-sm font-semibold">Support reordering</div>
                            <div className="mt-1 text-xs text-white/60">
                                Compare predicted demand against stock and generate suggested reorder
                                quantities.
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="text-sm font-semibold">Assess stock risk</div>
                            <div className="mt-1 text-xs text-white/60">
                                View AI-supported stock risk levels to help identify products at risk
                                of understocking.
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center justify-between">
                        <div className="font-semibold">Monthly revenue</div>
                        <div className="text-xs text-white/50">Last 6 months</div>
                    </div>

                    <div className="mt-4">
                        {series.length === 0 ? (
                            <div className="text-sm text-white/60">No sales data yet.</div>
                        ) : (
                            <MonthlySalesChart data={series} />
                        )}
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center justify-between">
                        <div className="font-semibold">Reorder suggestions</div>
                        <div className="text-xs text-white/50">
                            Last 30 days · Lead 7 days
                        </div>
                    </div>

                    <div className="mt-4 divide-y divide-white/10">
                        {reorder.length === 0 ? (
                            <div className="text-sm text-white/60">
                                No suggestions yet. Record sales to generate demand history.
                            </div>
                        ) : (
                            reorder.map((r) => (
                                <div
                                    key={r.sku}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div>
                                        <div className="font-medium">{r.name}</div>
                                        <div className="text-xs text-white/50">
                                            {r.sku} · Current stock: {r.currentStock}
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold">
                                        +{r.suggestedReorderQty}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center justify-between">
                        <div className="font-semibold">Top products</div>
                        <div className="text-xs text-white/50">By revenue</div>
                    </div>

                    <div className="mt-4 divide-y divide-white/10">
                        {top.length === 0 ? (
                            <div className="text-sm text-white/60">
                                No data yet. Record some sales.
                            </div>
                        ) : (
                            top.map((p) => (
                                <div
                                    key={p.sku}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div>
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-white/50">
                                            {p.sku} · Units: {p.units}
                                        </div>
                                    </div>

                                    <div className="text-sm font-semibold">
                                        {money(p.revenue)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Staff Dashboard</div>
                <div className="text-sm text-white/60">Daily operations overview</div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}

            <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Visible products" value={String(staffProducts.length)} />
                <StatCard label="My sales" value={String(staffSales.length)} />
                <StatCard label="My sales value" value={money(staffTotalSalesValue)} />
                <StatCard label="Units sold" value={String(staffTotalUnitsSold)} />
            </div>

            <GlassCard>
                <div className="flex items-center justify-between">
                    <div className="font-semibold">Today’s workflow</div>
                    <div className="text-xs text-white/50">Staff access</div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold">1. View products</div>
                        <div className="mt-1 text-xs text-white/60">
                            Check available stock and product pricing before processing a sale.
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold">2. Use POS</div>
                        <div className="mt-1 text-xs text-white/60">
                            Add items to cart and submit the transaction from the New Sale page.
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold">3. Review history</div>
                        <div className="mt-1 text-xs text-white/60">
                            Confirm previously recorded sales from the Sales History page.
                        </div>
                    </div>
                </div>
            </GlassCard>

            <GlassCard>
                <div className="flex items-center justify-between">
                    <div className="font-semibold">Recent sales</div>
                    <div className="text-xs text-white/50">Last 5 recorded by you</div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                    {recentStaffSales.length === 0 ? (
                        <div className="text-sm text-white/60">
                            No sales recorded yet. Go to New Sale to start using the POS.
                        </div>
                    ) : (
                        recentStaffSales.map((sale) => (
                            <div
                                key={sale._id}
                                className="py-3 flex items-center justify-between gap-4"
                            >
                                <div>
                                    <div className="font-medium">Sale #{sale._id.slice(-6)}</div>
                                    <div className="text-xs text-white/50">
                                        {formatDate(sale.createdAt)} · {sale.items.length} item
                                        {sale.items.length === 1 ? "" : "s"}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold">
                                    {money(sale.totalAmount)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>

            <GlassCard>
                <div className="flex items-center justify-between">
                    <div className="font-semibold">Available products snapshot</div>
                    <div className="text-xs text-white/50">First 5 products</div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                    {staffProducts.length === 0 ? (
                        <div className="text-sm text-white/60">No products available.</div>
                    ) : (
                        staffProducts.slice(0, 5).map((p) => (
                            <div
                                key={p._id}
                                className="py-3 flex items-center justify-between gap-4"
                            >
                                <div>
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-xs text-white/50">
                                        {p.sku} · {p.category || "Uncategorised"}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    Stock: <b>{p.quantityInStock}</b>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
}