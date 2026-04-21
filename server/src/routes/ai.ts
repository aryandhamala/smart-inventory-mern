import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { forecastDemand } from "../controllers/ai.controller";

export const aiRouter = Router();

aiRouter.use(authenticate);

// owner only
aiRouter.get("/forecast", requireRole("owner"), forecastDemand);