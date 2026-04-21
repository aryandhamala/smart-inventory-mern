import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { listStaffUsers, deleteStaffUser } from "../controllers/users.controller";

export const usersRouter = Router();

usersRouter.use(authenticate);

// owner only
usersRouter.get("/staff", requireRole("owner"), listStaffUsers);
usersRouter.delete("/staff/:id", requireRole("owner"), deleteStaffUser);