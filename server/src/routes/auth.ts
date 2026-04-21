import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

export const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/register", authenticate, requireRole("owner"), register);