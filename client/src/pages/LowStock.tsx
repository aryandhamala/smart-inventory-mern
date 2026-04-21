import React, { useEffect, useState } from "react";
import { lowStock } from "../api/analytics";
import { GlassCard } from "../components/Glass";

export function LowStockPage() {
    const [items, setItems] = useState<any[]>([]);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        lowStock().then(setItems).catch((e) => setErr(e.message));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Low Stock</div>
                <div className="text-sm text-white/60">Products at or below reorder threshold</div>
            </div>

            {err && <div className="text-red-300">{err}</div>}

            <GlassCard>
                <div className="divide-y divide-white/10">
                    {items.length === 0 ? (
                        <div className="text-sm text-white/60">No low-stock items.</div>
                    ) : (
                        items.map((p) => (
                            <div key={p._id} className="py-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-xs text-white/50">{p.sku}</div>
                                </div>
                                <div className="text-sm">
                                    Stock: <b className="text-amber-200">{p.quantityInStock}</b> / Threshold: {p.reorderThreshold}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
}