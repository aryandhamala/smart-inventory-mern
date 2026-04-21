import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { mustGetEnv } from "../utils/env";
import { HttpError } from "../utils/httpError";

export type AuthedUser = { userId: string; role: "owner" | "staff"; email: string };

export type AuthedRequest = Request & { user?: AuthedUser };

export function authenticate(req: AuthedRequest, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return next(new HttpError(401, "Unauthorized"));
    const token = header.slice("Bearer ".length);

    try {
        const payload = jwt.verify(token, mustGetEnv("JWT_SECRET")) as AuthedUser;
        req.user = payload;
        next();
    } catch {
        next(new HttpError(401, "Invalid token"));
    }
}