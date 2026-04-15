import express from 'express';
import { getFeedback, getHistory } from '../controller/resumeFeedbackController.js';
import { auth } from '../middleware/auth.js';

export const ressumeRouter = express.Router();

ressumeRouter.post("/feedback", auth, getFeedback);
ressumeRouter.get("/history", auth, getHistory);
