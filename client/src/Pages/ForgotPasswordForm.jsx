import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apiClient";

const ForgotPasswordForm = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/request", { email });
      alert(res.data.message);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/reset", { email, otp, newPassword });
      alert(res.data.message);
      setStep(1);
      setEmail(""); setOtp(""); setNewPassword("");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-100 px-4">
      <form className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        {step === 1 && <>
          <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password</h2>
          <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100"/>
          <button onClick={handleRequestOtp} disabled={loading} className={`w-full py-3 rounded ${loading?"bg-gray-600":"bg-white text-black hover:bg-gray-700"}`}>
            {loading?"Sending OTP...":"Send OTP"}
          </button>
        </>}
        {step === 2 && <>
          <h2 className="text-3xl font-bold mb-6 text-center">Reset Password</h2>
          <input type="text" placeholder="OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} required className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100"/>
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100"/>
          <button onClick={handleResetPassword} disabled={loading} className={`w-full py-3 rounded ${loading?"bg-gray-600":"bg-gray-800 hover:bg-gray-700"} text-white`}>
            {loading?"Resetting...":"Reset Password"}
          </button>
        </>}
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
