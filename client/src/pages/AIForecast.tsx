import React, { useState } from "react";
import { forecastDemand } from "../api/ai";
import { GlassCard, GlassPanel } from "../components/Glass";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

function moneyLikeNumber(n: number) {
    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
    }).format(n);
}

export function AIForecastPage() {
    const [store, setStore] = useState(1);
    const [item, setItem] = useState(1);
    const [days, setDays] = useState(7);

    const [result, setResult] = useState<{
        store: number;
        item: number;
        days: number;
        predictedDemand: number;
        dailyForecast: number[];
        currentStock: number;
        suggestedReorder: number;
        stockRisk: "LOW" | "MEDIUM" | "HIGH";
    } | null>(null);

    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function runForecast() {
        setErr(null);
        setBusy(true);
        try {
            const res = await forecastDemand(store, item, days);
            setResult(res);
        } catch (e: any) {
            setErr(e.message || "Failed to run AI forecast");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-2xl font-bold tracking-tight">
                    AI Demand Forecast
                </div>
                <div className="text-sm text-white/60">
                    Owner-only machine learning forecast trained using a Kaggle retail
                    demand forecasting dataset
                </div>
            </div>

            {err && <GlassPanel className="border-red-400/30">{err}</GlassPanel>}

            <GlassCard>
                <div className="grid gap-3 md:grid-cols-4">
                    <Input
                        label="Store ID"
                        type="number"
                        value={store}
                        onChange={(e) => setStore(Number(e.target.value))}
                    />
                    <Input
                        label="Item ID"
                        type="number"
                        value={item}
                        onChange={(e) => setItem(Number(e.target.value))}
                    />
                    <Input
                        label="Forecast Days"
                        type="number"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                    />
                    <div className="flex items-end">
                        <Button className="w-full" disabled={busy} onClick={runForecast}>
                            {busy ? "Forecasting..." : "Run Forecast"}
                        </Button>
                    </div>
                </div>

                <div className="mt-4 text-xs text-white/50">
                    This AI module uses a machine learning model trained on a Kaggle
                    retail demand forecasting dataset. It is integrated into the
                    application as a decision-support feature for demand prediction and
                    reorder planning.
                </div>
            </GlassCard>

            {result && (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <GlassCard>
                            <div className="text-xs text-white/60">Predicted demand</div>
                            <div className="mt-2 text-2xl font-bold">
                                {moneyLikeNumber(result.predictedDemand)}
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="text-xs text-white/60">Current stock</div>
                            <div className="mt-2 text-2xl font-bold">
                                {moneyLikeNumber(result.currentStock)}
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="text-xs text-white/60">Suggested reorder</div>
                            <div className="mt-2 text-2xl font-bold">
                                {moneyLikeNumber(result.suggestedReorder)}
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="text-xs text-white/60">Stock risk</div>
                            <div className="mt-2 text-2xl font-bold">{result.stockRisk}</div>
                        </GlassCard>
                    </div>

                    <GlassCard>
                        <div className="font-semibold">How to interpret this forecast</div>
                        <div className="mt-4 space-y-2 text-sm text-white/70">
                            <div>
                                <span className="font-medium text-white">
                                    Predicted demand:
                                </span>{" "}
                                estimated total unit demand over the selected forecast horizon.
                            </div>
                            <div>
                                <span className="font-medium text-white">
                                    Suggested reorder:
                                </span>{" "}
                                recommended quantity to restock based on predicted demand and
                                available stock.
                            </div>
                            <div>
                                <span className="font-medium text-white">Stock risk:</span>{" "}
                                risk level indicating whether current stock is likely to be
                                insufficient relative to forecasted demand.
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="font-semibold">Daily forecast</div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-7">
                            {result.dailyForecast.map((v, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                                >
                                    <div className="text-xs text-white/50">Day {i + 1}</div>
                                    <div className="mt-2 text-lg font-bold">
                                        {moneyLikeNumber(v)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </>
            )}
        </div>
    );
}