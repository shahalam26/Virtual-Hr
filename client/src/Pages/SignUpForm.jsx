import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apiClient";

const SignUpForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = SignUp, 2 = OTP Verify
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      alert(res.data.message);
      setStep(2); // OTP verification step
    } catch (err) {
      alert(err.response?.data?.message || "Sign Up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email: formData.email,
        otp
      });
      alert(res.data.message);
      navigate("/login"); // OTP verified → go to login
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-100 px-4">
      {step === 1 && (
        <form className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSignUp}>
          <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100" />
          <button type="submit" disabled={loading} className={`w-full py-3 rounded ${loading ? "bg-gray-600" : "bg-black hover:bg-amber-50 hover:text-black"} text-white mb-4`}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleVerifyOtp}>
          <h2 className="text-3xl font-bold mb-6 text-center">Verify OTP</h2>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100" />
          <button type="submit" disabled={loading} className={`w-full py-3 rounded ${loading ? "bg-gray-600" : "bg-black hover:bg-amber-50 hover:text-black"} text-white mb-4`}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SignUpForm;
