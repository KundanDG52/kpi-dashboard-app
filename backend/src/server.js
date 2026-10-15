import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import kpiRoutes from "./routes/kpiRoutes.js";
import redisClient from "./redisClient.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Mount the KPI routes
app.use("/api/kpis", kpiRoutes);

// Connect to Redis, then start the server
await redisClient.connect();

// Base test route
app.get("/", (req, res) => {
  res.send("KPI Dashboard API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
