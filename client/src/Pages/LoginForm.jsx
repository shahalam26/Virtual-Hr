import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../apiClient";
import { AppContent } from "../context/AppContextValue";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setUserData, setIsLoggedIn, backendUrl } = useContext(AppContent); // context se le rahe

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      // Update App context
      setUserData(res.data.user);
      setIsLoggedIn(true);

      navigate("/"); // redirect after login
    } catch (err) {
      console.log(err.response?.data); // debug
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault()
  
    window.location.href = `${backendUrl}/auth/google`;
  
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-100 px-4">
      <form
        className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 rounded bg-gray-800 text-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded ${
            loading ? "bg-gray-600" : "bg-black hover:bg-gray-700"
          } text-white mb-4`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded bg-white text-black hover:bg-amber-50 mb-4"
        >
          Login with Google
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/signup" className="underline text-blue-400">
            Sign Up
          </Link>
          <Link to="/forgotpassword" className="underline text-blue-300">
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
