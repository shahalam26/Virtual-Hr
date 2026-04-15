import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
name: { type: String, trim: true },
email: { type: String, required: true, unique: true, lowercase: true },
password: { type: String },
googleId: { type: String },
isVerified: { type: Boolean, default: false },
otp: { type: String },
otpExpiry: { type: Date }
}, { timestamps: true });


export default mongoose.model("User", userSchema);