import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeText: { type: String, required: false },
  score: { type: Number, required: true },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  extractedSkills: { type: [String], default: [] },
  summary: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("ResumeAnalysis", resumeSchema);
