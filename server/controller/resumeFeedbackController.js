import { getGeminiClient } from "../services/geminiClient.js";
import ResumeAnalysis from "../models/resumeModel.js";

export const getFeedback = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Check past history
    const lastSummary = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    let progressContext = "";
    if (lastSummary) {
      progressContext = `
      The user submitted a resume before. Their previous ATS Score was ${lastSummary.score}.
      Their previous weaknesses were: ${lastSummary.weaknesses.join(", ")}.
      Their previous suggestions were: ${lastSummary.suggestions.join(", ")}.
      Evaluate this new resume and note if they have improved on these in your 'Summary' field.
      `;
    }

    const schema = {
      type: "object",
      properties: {
        "ATS Score": { type: "number", description: "ATS Score out of 100" },
        "Strengths": { type: "array", items: { type: "string" } },
        "Weaknesses": { type: "array", items: { type: "string" } },
        "Suggestions": { type: "array", items: { type: "string" } },
        "Extracted Skills": { type: "array", items: { type: "string" } },
        "Summary": { type: "string", description: "short professional summary noting improvements from past" }
      },
      required: ["ATS Score", "Strengths", "Weaknesses", "Suggestions", "Extracted Skills", "Summary"]
    };

    const model = getGeminiClient().getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const prompt = `
You are an ATS (Applicant Tracking System) resume analyzer.
${progressContext}

Analyze the following resume text and provide the feedback.
Resume Text:
${text}
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text();
    
    // Clean up the output in case it's wrapped in markdown or contains extra text
    output = output.replace(/```json/g, "").replace(/```/g, "").trim();
    const startIndex = output.indexOf('{');
    const endIndex = output.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      output = output.substring(startIndex, endIndex + 1);
    }
    
    let parsedData = {};
    try {
      parsedData = JSON.parse(output);
    } catch (parseError) {
      console.error("Invalid JSON:", output);
      console.error("Parse Error:", parseError);
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }

    // Save history
    const newAnalysis = await ResumeAnalysis.create({
      userId,
      resumeText: text,
      score: parsedData["ATS Score"],
      strengths: parsedData["Strengths"],
      weaknesses: parsedData["Weaknesses"],
      suggestions: parsedData["Suggestions"],
      extractedSkills: parsedData["Extracted Skills"],
      summary: parsedData["Summary"]
    });

    return res.json(parsedData);
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await ResumeAnalysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resume history" });
  }
};
