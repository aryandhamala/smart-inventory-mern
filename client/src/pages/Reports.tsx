import React, { useState } from "react";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Button } from "../components/Button";
import { downloadFile } from "../api/download";

export function ReportsPage() {
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    async function dl(path: string, filename: string) {
        setErr(null);
        setOk(null);
        try {
            await downloadFile(path, filename);
            setOk(`${filename} downloaded`);
        } catch (e: any) {
            setErr(e.message || "Download failed");
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">Reports</div>
                <div className="text-sm text-white/60">Owner-only CSV exports</div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}
            {ok && <GlassPanel className="border-emerald-400/30">{ok}</GlassPanel>}

            <GlassCard className="space-y-4">
                <div className="font-semibold">Export data</div>

                <div className="flex flex-col gap-3 md:flex-row">
                    <Button onClick={() => dl("/export/products.csv", "products.csv")}>
                        Download Products CSV
                    </Button>
                    <Button onClick={() => dl("/export/sales.csv", "sales.csv")}>
                        Download Sales CSV
                    </Button>
                </div>

                <div className="text-xs text-white/50">
                    Sales export is flattened: one row per sale item (best for Excel/analysis).
                </div>
            </GlassCard>
        </div>
    );
}