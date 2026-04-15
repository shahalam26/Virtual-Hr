import dotenv from "dotenv";
// 1. Correct the package name
import { GoogleGenerativeAI } from "@google/generative-ai"; 

dotenv.config();

export const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in .env");
  }

  // 2. Correct the class name and the way the key is passed
  // It takes the string directly, not an object with { apiKey: ... }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};