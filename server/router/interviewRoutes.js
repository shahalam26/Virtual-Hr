import express from "express";
import { auth } from "../middleware/auth.js";
import multer from "multer";
import { startInterview, continueInterview, analyzeVideo, getInterviewHistory } from "../controller/interviewController.js";

export const interviewRouter = express.Router();

// set up multer for temp file upload
const upload = multer({ dest: "uploads/" });

interviewRouter.post("/start", auth, startInterview);
interviewRouter.post("/reply", auth, continueInterview);
interviewRouter.post("/analyze-video", auth, upload.single("video"), analyzeVideo);
interviewRouter.get("/history", auth, getInterviewHistory);
