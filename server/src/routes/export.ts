import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { exportProductsCsv, exportSalesCsv } from "../controllers/export.controller";

export const exportRouter = Router();

exportRouter.use(authenticate);
exportRouter.get("/products.csv", requireRole("owner"), exportProductsCsv);
exportRouter.get("/sales.csv", requireRole("owner"), exportSalesCsv);