import { Request, Response, NextFunction } from "express";
import { spawn } from "child_process";
import path from "path";
import { Product } from "../models/Product";
import { HttpError } from "../utils/httpError";

export async function forecastDemand(req: Request, res: Response, next: NextFunction) {
    try {
        const store = Math.max(1, Number(req.query.store || 1));
        const item = Number(req.query.item);
        const days = Math.max(1, Math.min(30, Number(req.query.days || 7)));

        if (!item) {
            throw new HttpError(400, "Missing required query parameter: item");
        }

        const mlDir = path.resolve(process.cwd(), "../ml");
        const scriptPath = path.join(mlDir, "predict.py");

        const py = spawn("python", [scriptPath, String(store), String(item), String(days)], {
            cwd: mlDir,
        });

        let stdout = "";
        let stderr = "";

        py.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        py.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        py.on("close", async (code) => {
            try {
                if (code !== 0) {
                    return next(new HttpError(500, `AI prediction failed: ${stderr || "Unknown Python error"}`));
                }

                const parsed = JSON.parse(stdout);

                const product = await Product.findOne({}).sort({ createdAt: 1 }).lean();
                const currentStock = product?.quantityInStock ?? 0;

                const predictedDemand = Number(parsed.totalForecast || 0);
                const suggestedReorder = Math.max(0, Math.ceil(predictedDemand - currentStock));
                const stockRisk =
                    currentStock <= 0
                        ? "HIGH"
                        : currentStock < predictedDemand
                            ? "MEDIUM"
                            : "LOW";

                res.json({
                    store,
                    item,
                    days,
                    predictedDemand,
                    dailyForecast: parsed.dailyForecast || [],
                    currentStock,
                    suggestedReorder,
                    stockRisk,
                });
            } catch (err) {
                next(err);
            }
        });
    } catch (e) {
        next(e);
    }
}