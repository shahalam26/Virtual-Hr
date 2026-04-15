import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeText: { type: String, required: true },
  conversationHistory: { type: Array, default: [] }, // e.g. [{role: 'user', content: '...'}]
  score: { type: Number, required: true },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  improvementsFromLast: { type: String, default: "" },
  bodyLanguage: {
    score: { type: Number },
    feedback: { type: String }
  }
}, { timestamps: true });

export default mongoose.model("InterviewAnalysis", interviewSchema);
