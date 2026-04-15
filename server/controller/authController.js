import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateOtp, otpExpiryIn, sendOTPEmail } from "../utils/mailer.js";
import { signToken } from "../utils/jwt.js";

// -------------------- REGISTER USER --------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        // User exist hai but verify nahi hua → OTP resend
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = otpExpiryIn(10);
        await user.save();
        await sendOTPEmail(email, otp, "verification");
        return res.status(200).json({ message: "Email already exists but not verified. OTP resent." });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    // New user
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = otpExpiryIn(10);

    user = await User.create({ name, email, password: hashedPassword, otp, otpExpiry });
    await sendOTPEmail(email, otp, "verification");

    res.status(201).json({ message: "User registered, OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};


// -------------------- VERIFY OTP --------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// -------------------- LOGIN USER --------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ User check
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(400).json({ message: "User not found" });

    // 2️⃣ Verify check
    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = otpExpiryIn(10);
      await user.save();
      await sendOTPEmail(email, otp, "verification");
      return res.status(400).json({ message: "Please verify your email first. OTP has been sent." });
    }

    // 3️⃣ Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return res.status(400).json({ message: "Invalid credentials" });

    // 4️⃣ Generate JWT
    const token = signToken({ id: user._id, email: user.email });

    // 5️⃣ Send response
    // 5️⃣ Send response with cookie
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", 
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

res.status(200).json({ 
  message: "Login successful", 
  user: { name: user.name, email: user.email } 
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};



// -------------------- LOGOUT USER --------------------
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.json({ message: "Logged out successfully" });
};



// -------------------- GOOGLE OAUTH CALLBACK --------------------
export const googleCallback = async (req, res) => {
  try {
    const token = signToken({ id: req.user._id, email: req.user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.CLIENT_URL}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed" });
  }
};


// -------------------- FORGOT PASSWORD: REQUEST OTP --------------------
export const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }); // removed isVerified check

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = otpExpiryIn(10);
    await user.save();

    await sendOTPEmail(email, otp, "reset");
    res.json({ message: "Reset OTP sent to email" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

      
// -------------------- FORGOT PASSWORD: RESET --------------------
export const forgotPasswordReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, isVerified: true });

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10); // hash new password
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Password reset failed" });
  }
};

// -------------------- GET CURRENT USER (PROTECTED) --------------------
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

