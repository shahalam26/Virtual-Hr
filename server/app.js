
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbconnect.js";
import { authRouter } from "./router/authRoutes.js";
import { setupGoogleStrategy } from "./config/passport.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import { ressumeRouter } from "./router/resumeValidate.js";
import { interviewRouter } from "./router/interviewRoutes.js";

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://virtualinterviewer-eta.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());

// Passport configuration
setupGoogleStrategy();

// Server port
const PORT = process.env.PORT || 5000;

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Virtual HR API is running successfully 🚀",
    endpoints: {
      auth: "/auth",
      resume: "/resume",
      interview: "/api/interview",
      health: "/health",
    },
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Application routes
app.use("/auth", authRouter);
app.use("/resume", ressumeRouter);
app.use("/api/interview", interviewRouter);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal server error",
  });
});

// Start server after MongoDB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  });
