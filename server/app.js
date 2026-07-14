import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

/* ==========================================================
   Security Middleware
========================================================== */

app.use(helmet());

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "https://mern-trading-dashboard-1.onrender.com"
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ==========================================================
   General Middleware
========================================================== */

app.use(compression());

app.use(morgan("dev"));

app.use(cookieParser());

app.use(
  express.json({
    limit: "25mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  })
);

/* ==========================================================
   Rate Limiter
========================================================== */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

/* ==========================================================
   Health Check Routes
========================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    application: "High-Frequency Financial & Trading Dashboard API",
    version: "1.0.0",
    status: "Running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "Running",
    database: "Connected",
    timestamp: new Date(),
  });
});

/* ==========================================================
   API Routes
========================================================== */

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/trading", tradeRoutes);

app.use("/api/portfolio", portfolioRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/assets", assetRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/files", fileRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/admin", adminRoutes);

/* ==========================================================
   404 Route
========================================================== */

app.use(notFound);

/* ==========================================================
   Global Error Handler
========================================================== */

app.use(errorHandler);

/* ==========================================================
   Export App
========================================================== */

export default app;