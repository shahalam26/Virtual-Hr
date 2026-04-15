import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbconnect.js";
import { authRouter } from "./router/authRoutes.js";
import { setupGoogleStrategy } from "./config/passport.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import { ressumeRouter } from "./router/resumeValidate.js";
import { getGeminiModel } from "./services/geminiClient.js";

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

const chatSessions = new Map();

// 🟢 Start Interview
app.post("/api/start-interview", async (req, res) => {
  try {
    console.log("Start interview called");

    const { resumeText, userId } = req.body;

    if (!resumeText || !userId) {
      return res.status(400).json({ error: "resumeText and userId required" });
    }

    const model = getGeminiModel();

    /*
      model: "gemini-2.5-flash",   // 🔥 MAKE SURE THIS IS 2.5
    */

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            { text: `This is my resume: ${resumeText}` }
          ]
        }
      ],
    });

    chatSessions.set(userId, chat);

    const result = await chat.sendMessage("Start the interview with me.");

    return res.json({ reply: result.response.text() });

  } catch (err) {
    console.error("🔥 START INTERVIEW ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


// 🟢 Continue Interview
app.post("/api/interview", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message?.trim()) {
      return res.status(400).json({ error: "userId and message are required." });
    }

    const chat = chatSessions.get(userId);

    if (!chat) {
      return res.status(400).json({ error: "Interview not started." });
    }

    const result = await chat.sendMessage(message.trim());
    res.json({ reply: result.response.text() });

  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Test Route (for debugging)
app.get("/test-gemini", async (req, res) => {
  try {
    const model = getGeminiModel("gemini-1.5-flash");

    const result = await model.generateContent("Say hello");
    res.json({ reply: result.response.text() });

  } catch (err) {
    console.error("TEST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// MongoDB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
