import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Ensure env variables load ho rahe ho

// OTP generator
export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// OTP expiry (default 10 minutes)
export const otpExpiryIn = (mins = 10) => new Date(Date.now() + mins * 60 * 1000);

// Mail transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // tumhara email
    pass: process.env.EMAIL_PASS    // 16 char app password
  }
});

// Send OTP Email
export const sendOTPEmail = async (to, otp, purpose = "verification") => {
  try {
    const subject = purpose === "reset" ? "Password Reset OTP" : "Email Verification OTP";
    const text = `Your OTP is ${otp}. It expires in 10 minutes.`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,  // sender email
      to,
      subject,
      text
    });
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error("Failed to send OTP:", error.message);
    throw new Error("Failed to send OTP");
  }
};
