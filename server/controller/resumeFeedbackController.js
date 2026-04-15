import { getGeminiModel } from "../services/geminiClient.js";

export const getFeedback = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const model = getGeminiModel();
    const prompt = `
You are an ATS (Applicant Tracking System) resume analyzer.

Analyze the following resume text and respond ONLY with a valid JSON object.
Do NOT include explanations or markdown.

Use this EXACT JSON format:

{
  "ATS Score": number (0-100),
  "Strengths": ["list of strengths"],
  "Weaknesses": ["list of weaknesses"],
  "Suggestions": ["list of improvements"],
  "Extracted Skills": ["list of technical skills"],
  "Summary": "short professional summary"
}

Resume Text:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let output = response.text();

    output = output.replace(/```json|```/g, "").trim();

    try {
      return res.json(JSON.parse(output));
    } catch {
      console.error("Invalid JSON:", output);
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
