import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSaleById } from "../api/sales";
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

export function SaleInvoicePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sale, setSale] = useState<{
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
    } | null>(null);

    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getSaleById(id)
            .then(setSale)
            .catch((e) => setErr(e.message || "Failed to load invoice"));
    }, [id]);

    if (err) {
        return <GlassPanel className="border-red-400/30">{err}</GlassPanel>;
    }

    if (!sale) {
        return (
            <GlassCard>
                <div className="text-sm text-white/60">Loading invoice...</div>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6 print:space-y-4">
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <div className="text-2xl font-bold tracking-tight">Invoice</div>
                    <div className="text-sm text-white/60">
                        Printable invoice for completed sale
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button type="button" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                    <Button type="button" onClick={() => window.print()}>
                        Print / Save PDF
                    </Button>
                </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-900/90 p-8 shadow-2xl print:border-black print:bg-white print:text-black">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="text-2xl font-bold">Smart Inventory System</div>
                        <div className="mt-1 text-sm text-white/60 print:text-black/70">
                            Retail Sales Invoice
                        </div>
                    </div>

                    <div className="text-sm text-white/70 print:text-black/80">
                        <div>
                            <span className="font-semibold text-white print:text-black">
                                Invoice No:
                            </span>{" "}
                            #{sale._id.slice(-8)}
                        </div>
                        <div>
                            <span className="font-semibold text-white print:text-black">
                                Date:
                            </span>{" "}
                            {formatDate(sale.createdAt)}
                        </div>
                        <div>
                            <span className="font-semibold text-white print:text-black">
                                Seller:
                            </span>{" "}
                            {sale.createdBy.name} ({sale.createdBy.role})
                        </div>
                        <div>
                            <span className="font-semibold text-white print:text-black">
                                Email:
                            </span>{" "}
                            {sale.createdBy.email}
                        </div>
                    </div>
                </div>

                <div className="mt-8 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-white/10 print:border-black/20">
                                <th className="px-3 py-3 text-left font-semibold">SKU</th>
                                <th className="px-3 py-3 text-left font-semibold">Product</th>
                                <th className="px-3 py-3 text-right font-semibold">Qty</th>
                                <th className="px-3 py-3 text-right font-semibold">Unit Price</th>
                                <th className="px-3 py-3 text-right font-semibold">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item, idx) => (
                                <tr
                                    key={`${sale._id}-${idx}`}
                                    className="border-b border-white/10 print:border-black/10"
                                >
                                    <td className="px-3 py-3">{item.sku}</td>
                                    <td className="px-3 py-3">{item.name}</td>
                                    <td className="px-3 py-3 text-right">{item.quantity}</td>
                                    <td className="px-3 py-3 text-right">{money(item.unitPrice)}</td>
                                    <td className="px-3 py-3 text-right">{money(item.lineTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex justify-end">
                    <div className="w-full max-w-sm space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 print:border-black/20 print:bg-transparent">
                        <div className="flex items-center justify-between">
                            <span className="text-white/70 print:text-black/70">Items</span>
                            <span>{sale.items.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{money(sale.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-xs text-white/50 print:text-black/60">
                    Generated by the Smart Inventory Management System.
                </div>
            </div>
        </div>
    );
}