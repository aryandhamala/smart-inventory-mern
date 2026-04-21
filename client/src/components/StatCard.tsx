import React from "react";
import { GlassCard } from "./Glass";

export function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <GlassCard className="p-5">
            <div className="text-xs text-white/70">{label}</div>
            <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
        </GlassCard>
    );
}