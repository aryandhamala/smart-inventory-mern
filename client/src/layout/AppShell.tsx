import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";

export function AppShell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-6">
                <header className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="text-lg font-bold tracking-tight">Smart Inventory</div>
                        <div className="text-xs text-white/60">
                            {user ? `${user.name} · ${user.role}` : "Not signed in"}
                        </div>
                    </div>
                    {user && <Button onClick={logout}>Logout</Button>}
                </header>

                <main className="mt-6">{children}</main>
            </div>
        </div>
    );
}