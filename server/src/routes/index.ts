import { Router } from "express";
import { authRouter } from "./auth";
import { productsRouter } from "./products";
import { salesRouter } from "./sales";
import { analyticsRouter } from "./analytics";
import { stockRouter } from "./stock";
import { exportRouter } from "./export";
import { usersRouter } from "./users";
import { aiRouter } from "./ai";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/sales", salesRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/stock", stockRouter);
apiRouter.use("/export", exportRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/ai", aiRouter);