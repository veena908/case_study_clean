import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/routes";
import customerRoutes from "./modules/customers/routes";
import productRoutes from "./modules/products/routes";
import challanRoutes from "./modules/challans/routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
