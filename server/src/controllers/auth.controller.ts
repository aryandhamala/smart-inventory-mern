import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { registerSchema, loginSchema } from "../validators/auth.validators";
import { mustGetEnv } from "../utils/env";
import { HttpError } from "../utils/httpError";

function signToken(payload: { userId: string; role: "owner" | "staff"; email: string }) {
    return jwt.sign(payload, mustGetEnv("JWT_SECRET"), { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);

        const exists = await User.findOne({ email: data.email });
        if (exists) throw new HttpError(409, "Email already registered");

        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await User.create({ name: data.name, email: data.email, passwordHash, role: data.role });

        const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        next(e);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);

        const user = await User.findOne({ email: data.email });
        if (!user) throw new HttpError(401, "Invalid credentials");

        const ok = await bcrypt.compare(data.password, user.passwordHash);
        if (!ok) throw new HttpError(401, "Invalid credentials");

        const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        next(e);
    }
}