import React from 'react';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import LoginForm from './Pages/LoginForm';
import SignUpForm from './Pages/SignUpForm';
import ForgotPasswordForm from './Pages/ForgotPasswordForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './context/AppContext';
import Services from "./Pages/Services";

import 'react-toastify/dist/ReactToastify.css';
import { ResumeUpload } from './Pages/ResumeUpload';
import ChatPage from './Pages/ChatPage';
import VoiceInterviewPage from "./Pages/VoiceInterviewPage";




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
         <Route path="/resumeFeedback" element={<ResumeUpload />} />
           <Route path="/chat" element={<ChatPage />} />
        <Route path="/features" element={<Services />} />
        <Route path="/demo" element={<Services />} />
        <Route path="/pricing" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="/interview/voice" element={<VoiceInterviewPage />} />
        <Route path="/interview/video" element={<ChatPage />} />
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
