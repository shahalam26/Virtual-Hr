import React from 'react';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import LoginForm from './Pages/LoginForm';
import SignUpForm from './Pages/SignUpForm';
import ForgotPasswordForm from './Pages/ForgotPasswordForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './context/AppContext';
import { AppContent } from './context/AppContextValue';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import Services from "./Pages/Services";

import 'react-toastify/dist/ReactToastify.css';
import { ResumeUpload } from './Pages/ResumeUpload';
import ResumeBuilder from './Pages/ResumeBuilder';
import ChatPage from './Pages/ChatPage';
import VoiceInterviewPage from "./Pages/VoiceInterviewPage";
import VideoInterviewPage from "./Pages/VideoInterviewPage";
import ProgressTracker from "./Pages/ProgressTracker";




const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, userData } = useContext(AppContent);
  const location = useLocation();

  if (!isLoggedIn && !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/forgotpassword" element={<ForgotPasswordForm />} />
        <Route path="/features" element={<Services />} />
        <Route path="/demo" element={<Services />} />
        <Route path="/pricing" element={<Home />} />
        <Route path="/about" element={<Home />} />

        {/* Protected Routes */}
        <Route path="/resumeFeedback" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/interview/voice" element={<ProtectedRoute><VoiceInterviewPage /></ProtectedRoute>} />
        <Route path="/interview/video" element={<ProtectedRoute><VideoInterviewPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
