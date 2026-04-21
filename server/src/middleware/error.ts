import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";

export function notFound(_req: Request, res: Response) {
    res.status(404).json({ message: "Not found" });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError ? err.message : "Internal server error";
    if (status === 500) console.error(err);
    res.status(status).json({ message });
}