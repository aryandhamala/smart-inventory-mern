// client/src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AppShell } from "./layout/AppShell";
import { ProtectedLayout } from "./layout/ProtectedLayout";

import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { ProductsPage } from "./pages/Products";
import { NewSalePage } from "./pages/NewSale";
import { SaleInvoicePage } from "./pages/SaleInvoice";
import { EditProductPage } from "./pages/EditProduct";
import { LowStockPage } from "./pages/LowStock";
import { ReplenishPage } from "./pages/Replenish";
import { ReportsPage } from "./pages/Reports";
import { StaffUsersPage } from "./pages/StaffUsers";
import { SalesHistoryPage } from "./pages/SalesHistory";
import { AllSalesHistoryPage } from "./pages/AllSalesHistory";

import { AIForecastPage } from "./pages/AIForecast";

function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "owner") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/sales/new" element={<NewSalePage />} />
              <Route path="/sales/:id/invoice" element={<SaleInvoicePage />} />
              <Route path="/analytics/low-stock" element={<LowStockPage />} />
              <Route path="/sales/history" element={<SalesHistoryPage />} />

              <Route
                path="/stock/replenish"
                element={
                  <OwnerOnly>
                    <ReplenishPage />
                  </OwnerOnly>
                }
              />
              <Route
                path="/reports"
                element={
                  <OwnerOnly>
                    <ReportsPage />
                  </OwnerOnly>
                }
              />
              <Route
                path="/users/staff"
                element={
                  <OwnerOnly>
                    <StaffUsersPage />
                  </OwnerOnly>
                }
              />

              <Route
                path="/products/:id/edit"
                element={
                  <OwnerOnly>
                    <EditProductPage />
                  </OwnerOnly>
                }
              />

              <Route
                path="/sales/all"
                element={
                  <OwnerOnly>
                    <AllSalesHistoryPage />
                  </OwnerOnly>
                }
              />

              <Route
                path="/ai/forecast"
                element={
                  <OwnerOnly>
                    <AIForecastPage />
                  </OwnerOnly>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}