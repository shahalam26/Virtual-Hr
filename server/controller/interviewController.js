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
    2. Ask around 5 questions, ONE BY ONE. Wait for the candidate's answer before asking the next.
    3. You must judge their answers, ask follow-up questions if their answer is weak, and adapt organically like a real interview.
    4. You will receive the candidate's text answer along with snapshot images of their face taken while they were speaking. You MUST observe their emotions and body language from these images, combine this with their text answer, and use it to form your next question and evaluation. Mention their body language naturally if relevant.
    5. Once you have asked sufficient questions (around 5-7) and feel you have securely evaluated the candidate, you MUST terminate the interview immediately.
    6. To terminate the interview, your VERY NEXT MESSAGE must consist entirely of the following string block (with valid JSON inside). Do not include any greeting or conversational filler before or after it:
    
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
    
    let aiMessage = message.trim();
    
    // Construct multimodal parts
    let parts = [{ text: aiMessage }];
    if (req.body.images && Array.isArray(req.body.images)) {
       req.body.images.forEach(base64Image => {
           parts.push({
               inlineData: {
                   mimeType: "image/jpeg",
                   data: base64Image
               }
           });
       });
       parts.push({ text: `\n\n[System Note: The above images were captured while the candidate was answering. You MUST analyze their emotion and body language from these images and explicitly mention your observation in your response. (e.g. "I see you're smiling," or "You look a bit nervous, take a breath.")]` });
    }

    const result = await session.chat.sendMessage(parts);
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

    // 1. Initialize Google AI File Manager
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    
    // 2. Upload the video to Gemini
    const uploadResult = await fileManager.uploadFile(req.file.path, {
        mimeType: req.file.mimetype,
        displayName: "Interview Video",
    });
    
    // 2.5 Wait for video to finish processing
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === "PROCESSING") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        file = await fileManager.getFile(uploadResult.file.name);
    }
    if (file.state === "FAILED") {
        throw new Error("Gemini failed to process the video file.");
    }
    
    // 3. Use Gemini to analyze the video
    const model = getGeminiModel("gemini-1.5-flash"); // Flash is better for multimodal
    const prompt = `
    You are an advanced HR Emotion & Body Language Analyzer.
    Watch the candidate's interview responses.
    Identify their primary emotion, confidence level, and eye contact.
    Reply ONLY with valid JSON in this exact format:
    {
      "score": <number 0-100 indicating visual confidence>,
      "feedback": "<detailed string analyzing body language and emotions>"
    }
    `;
    
    const result = await model.generateContent([
        {
            fileData: {
                mimeType: uploadResult.file.mimeType,
                fileUri: uploadResult.file.uri
            }
        },
        { text: prompt }
    ]);
    
    // 4. Cleanup the file from Gemini
    await fileManager.deleteFile(uploadResult.file.name);
    
    let output = result.response.text().trim();
    output = output.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const evaluation = JSON.parse(output);

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
