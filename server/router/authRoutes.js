import express from 'express';
import passport from "passport";
import { auth } from "../middleware/auth.js";

import { 
  registerUser, 
  verifyOtp, 
  loginUser, 
  googleCallback, 
  forgotPasswordRequest, 
  forgotPasswordReset, 
  getMe, 
  logoutUser
} from '../controller/authController.js';

export const authRouter = express.Router();

// Email Auth
authRouter.post("/register", registerUser);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

// Google OAuth
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);



// Forgot Password
authRouter.post("/forgot/request", forgotPasswordRequest);
authRouter.post("/forgot/reset", forgotPasswordReset);

// Protected route
authRouter.get("/me", auth, getMe);
