import React from "react";

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={
                "rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] " +
                "p-6 " + className
            }
        >
            {children}
        </div>
    );
}

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={"rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl p-4 " + className}>
            {children}
        </div>
    );
}