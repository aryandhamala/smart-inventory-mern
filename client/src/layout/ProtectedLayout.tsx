import React from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GlassPanel } from "../components/Glass";

function Nav() {
    const { user } = useAuth();
    const isOwner = user?.role === "owner";

    return (
        <GlassPanel className="mb-6">
            <div className="flex flex-wrap gap-3 text-sm">
                <Link className="text-white/80 hover:text-white" to="/dashboard">
                    Dashboard
                </Link>

                <Link className="text-white/80 hover:text-white" to="/products">
                    Products
                </Link>

                <Link className="text-white/80 hover:text-white" to="/sales/new">
                    New Sale
                </Link>

                <Link className="text-white/80 hover:text-white" to="/sales/history">
                    Sales History
                </Link>

                {isOwner && (
                    <>
                        <Link
                            className="text-white/80 hover:text-white"
                            to="/analytics/low-stock"
                        >
                            Low Stock
                        </Link>

                        <Link
                            className="text-white/80 hover:text-white"
                            to="/reports"
                        >
                            Reports
                        </Link>

                        <Link className="text-white/80 hover:text-white"
                            to="/users/staff">
                            Staff Users
                        </Link>

                        <Link className="text-white/80 hover:text-white" to="/sales/all">
                            All Sales
                        </Link>

                        <Link className="text-white/80 hover:text-white" to="/ai/forecast">
                            AI Forecast
                        </Link>
                    </>
                )}
            </div>
        </GlassPanel>
    );
}

export function ProtectedLayout() {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" replace />;

    return (
        <>
            <Nav />
            <Outlet />
        </>
    );
}