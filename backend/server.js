import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connectDatabase.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "https://task-manager-gamma-one-67.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/tasks", taskRoutes);

// Routes
app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});