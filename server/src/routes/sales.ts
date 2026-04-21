import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import {
    createSale,
    mySales,
    allSales,
    getSaleById,
} from "../controllers/sales.controller";

export const salesRouter = Router();
salesRouter.use(authenticate);

salesRouter.post("/", requireRole("owner", "staff"), createSale);
salesRouter.get("/mine", requireRole("owner", "staff"), mySales);
salesRouter.get("/all", requireRole("owner"), allSales);
salesRouter.get("/:id", requireRole("owner", "staff"), getSaleById);