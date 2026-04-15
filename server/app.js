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

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

setupGoogleStrategy();

const PORT = process.env.PORT || 5000;

app.use("/auth", authRouter);
app.use("/resume", ressumeRouter);
app.use("/api/interview", interviewRouter);

// MongoDB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
