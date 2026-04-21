import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { HttpError } from "../utils/httpError";

export async function listStaffUsers(_req: Request, res: Response, next: NextFunction) {
    try {
        const staff = await User.find({ role: "staff" })
            .select("_id name email role createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();

        res.json(staff);
    } catch (e) {
        next(e);
    }
}

export async function deleteStaffUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            throw new HttpError(404, "Staff user not found");
        }

        if (user.role !== "staff") {
            throw new HttpError(400, "Only staff users can be deleted from this page");
        }

        await User.findByIdAndDelete(id);

        res.json({ ok: true });
    } catch (e) {
        next(e);
    }
}