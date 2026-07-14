// import http from 'http';
// import app from './app.js';
// import { connectDB } from './config/db.js';
// import { initializeGridFS } from './gridfs/gridfs.js';
// import { initializeSocket } from './socket/socketServer.js';
// import dotenv from 'dotenv';

// dotenv.config();
// await connectDB();
// initializeGridFS();

// const port = process.env.PORT || 5000;
// const server = http.createServer(app);
// initializeSocket(server);

// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


// import http from 'http';
// import dotenv from 'dotenv';

// dotenv.config();

// console.log("PORT =", process.env.PORT);
// console.log("MONGODB_URI =", process.env.MONGODB_URI);

// import app from './app.js';
// import { connectDB } from './config/db.js';
// import { initializeGridFS } from './gridfs/gridfs.js';
// import { initializeSocket } from './socket/socketServer.js';

// await connectDB();
// initializeGridFS();

// const port = process.env.PORT || 5000;
// const server = http.createServer(app);

// initializeSocket(server);

// server.listen(port, () => {
//   console.log(`✅ Server running on port ${port}`);
// });


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";

// Socket
import { initializeSocket } from "./socket/socket.js";
import { startFinnhubMarket } from "./socket/finnhubService.js";

//Razorpay
import paymentRoutes from "./routes/paymentRoutes.js";

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

// Initialize Express App
const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads (KYC Docs, Profile Pics)
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trading API is running successfully 🚀",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/kyc", kycRoutes);

// Razorpay Payment Routes
app.use("/api/payment", paymentRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Withdrawal Routes
app.use("/api/withdrawals", withdrawalRoutes);

// Handle Unknown Routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});



// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Start Real-Time Market Feed from Finnhub
  startFinnhubMarket();
});