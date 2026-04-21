import { Response, NextFunction } from "express";
import { AuthedRequest } from "./auth";
import { HttpError } from "../utils/httpError";

export function requireRole(...roles: Array<"owner" | "staff">) {
    return (req: AuthedRequest, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new HttpError(401, "Unauthorized"));
        if (!roles.includes(req.user.role)) return next(new HttpError(403, "Forbidden"));
        next();
    };
}