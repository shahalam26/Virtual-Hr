import { getGeminiModel, getGeminiClient } from "../services/geminiClient.js";
import InterviewAnalysis from "../models/interviewModel.js";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";

// In-memory chat sessions for active interviews
const chatSessions = new Map();

export const startInterview = async (req, res) => {
  try {
    const { resumeText } = req.body;
    const userId = req.user.id;

    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    // 1. Fetch prior interview to guide the AI
    const lastInterview = await InterviewAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    let progressContext = "";
    if (lastInterview) {
      progressContext = `
      The candidate has interviewed before. Their last score was ${lastInterview.score}/100.
      Their weaknesses were: ${lastInterview.weaknesses.join(", ")}.
      Keep an eye on whether they have improved on these.
      `;
    }

    const model = getGeminiModel("gemini-2.5-flash");

    // 2. Set strict instructions for the Interviewer
    const systemInstruction = `
    You are an expert HR Interviewer conducting a mock interview.
    ${progressContext}
    
    CRITICAL RULES:
    1. Base your questions on the provided resume.
    2. Ask exactly 2 questions, ONE BY ONE. Wait for the user's answer before asking the next.
    3. The MOMENT you receive the user's answer to your 2nd question, you MUST terminate the interview immediately.
    4. You MUST NOT ask a 3rd question. You MUST NOT ask if they have questions for you.
    5. To terminate the interview, your VERY NEXT MESSAGE must consist entirely of the following string block (with valid JSON inside). Do not include any greeting or conversational filler before or after it:
    
    [END_INTERVIEW]
    \`\`\`json
    {
      "score": <number 0-100>,
      "strengths": ["<string>", "<string>"],
      "weaknesses": ["<string>", "<string>"],
      "improvementsFromLast": "<text summarizing improvements based on past weaknesses>"
    }
    \`\`\`
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `Here is my resume:\n${resumeText}\n\nInstructions:\n${systemInstruction}` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will begin the interview now." }]
        }
      ],
    });

    chatSessions.set(userId, { chat, history: [], resumeText });

    const result = await chat.sendMessage("Start the interview by asking the first question.");
    const aiReply = result.response.text();

    const session = chatSessions.get(userId);
    session.history.push({ role: "assistant", content: aiReply });

    return res.json({ reply: aiReply });

  } catch (err) {
    console.error("🔥 START INTERVIEW ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const continueInterview = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required." });
    }

    const session = chatSessions.get(userId);
    if (!session) {
      return res.status(400).json({ error: "Interview not started." });
    }

    session.history.push({ role: "user", content: message });
    
    const result = await session.chat.sendMessage(message.trim());
    let aiReply = result.response.text();

    if (aiReply.includes("[END_INTERVIEW]")) {
      // The interview finished!
      let jsonPart = aiReply.split("[END_INTERVIEW]")[1].trim();
      jsonPart = jsonPart.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();

      try {
        const evaluation = JSON.parse(jsonPart);
        
        // Save to Database
        const finalAnalysis = await InterviewAnalysis.create({
          userId,
          resumeText: session.resumeText,
          conversationHistory: session.history,
          score: evaluation.score,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          improvementsFromLast: evaluation.improvementsFromLast,
        });

        // Clear session
        chatSessions.delete(userId);

        return res.json({
          reply: "Thank you for your time. The interview is now concluded. I am preparing your report.",
          finished: true,
          evaluation: finalAnalysis,
          interviewId: finalAnalysis._id
        });

      } catch (parseErr) {
        console.error("AI JSON Parse Error:", parseErr, jsonPart);
        return res.status(500).json({ error: "Failed to parse final AI evaluation." });
      }
    }

    session.history.push({ role: "assistant", content: aiReply });
    res.json({ reply: aiReply, finished: false });

  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const analyzeVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided." });
    }
    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ error: "Interview ID required." });
    }

    // 1. Read multer file into native Blob
    const fileBuffer = fs.readFileSync(req.file.path);
    const videoBlob = new Blob([fileBuffer], { type: req.file.mimetype });
    
    // 2. Prepare Form Data to proxy to Python
    const formData = new FormData();
    formData.append("video", videoBlob, req.file.originalname || "video.webm");

    // 3. Request the Python Microservice (Option B Pivot)
    const pythonResponse = await fetch("http://localhost:5001/analyze-video", {
      method: "POST",
      body: formData
    });

    if (!pythonResponse.ok) {
       throw new Error(`Python server error: ${pythonResponse.statusText}`);
    }

    const evaluation = await pythonResponse.json();

    // 4. Update MongoDB
    const updatedRecord = await InterviewAnalysis.findByIdAndUpdate(
      interviewId,
      {
        bodyLanguage: {
          score: evaluation.score,
          feedback: evaluation.feedback
        }
      },
      { new: true }
    );

    // 5. Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.json(updatedRecord);
  } catch (error) {
    console.error("Video Analysis Error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const history = await InterviewAnalysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
