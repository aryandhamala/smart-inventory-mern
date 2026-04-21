import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { dashboardSummary, lowStockList, monthlySales, topProducts, reorderSuggestions } from "../controllers/analytics.controller";

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);

// analytics typically owner-only (you can loosen if required)
analyticsRouter.get("/summary", requireRole("owner"), dashboardSummary);
analyticsRouter.get("/low-stock", requireRole("owner"), lowStockList);
analyticsRouter.get("/monthly-sales", requireRole("owner"), monthlySales);
analyticsRouter.get("/top-products", requireRole("owner"), topProducts);
analyticsRouter.get("/reorder-suggestions", requireRole("owner"), reorderSuggestions);