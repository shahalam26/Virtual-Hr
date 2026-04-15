import express from 'express';
import { getFeedback } from '../controller/resumeFeedbackController.js';
export const ressumeRouter = express.Router();

ressumeRouter.post("/feedback",getFeedback);
