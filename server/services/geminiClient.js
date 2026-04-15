import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in .env");
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export const getGeminiModel = (modelName = "gemini-2.5-flash") =>
  getGeminiClient().getGenerativeModel({ model: modelName });
