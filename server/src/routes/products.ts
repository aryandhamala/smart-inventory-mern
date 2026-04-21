import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../controllers/products.controller";

export const productsRouter = Router();

productsRouter.use(authenticate);

productsRouter.get("/", listProducts);
productsRouter.get("/:id", getProduct);

// owner-only writes
productsRouter.post("/", requireRole("owner"), createProduct);
productsRouter.patch("/:id", requireRole("owner"), updateProduct);
productsRouter.delete("/:id", requireRole("owner"), deleteProduct);