import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { replenishStock } from "../controllers/stock.controller";

export const stockRouter = Router();

stockRouter.use(authenticate);

// owner only
stockRouter.post("/replenish", requireRole("owner"), replenishStock);