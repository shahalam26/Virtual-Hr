import React, { useEffect, useRef, useState } from "react";
import api from "../apiClient";
import { extractTextFromPdf } from "../utils/pdf";

const VoiceInterviewPage = () => {
  const [messages, setMessages] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [started, setStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  const speak = (text, onEnd) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    
    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        void sendMessage(transcript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await extractTextFromPdf(file);
      setResumeText(text);
    } catch (error) {
      console.error("Failed to read PDF:", error);
      alert("Unable to read that PDF. Please try another file.");
    }
  };

  const startInterview = async () => {
    if (!resumeText) return alert("Please upload resume first");

    try {
      setIsTyping(true);
      const { data } = await api.post("/api/interview/start", { resumeText });
      const firstQuestion = data.reply;

      setMessages([{ role: "assistant", content: firstQuestion }]);
      setStarted(true);
      speak(firstQuestion); // wait for user to click talk manually to avoid interruption
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to start interview");
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    try {
      setIsTyping(true);
      const { data } = await api.post("/api/interview/reply", { message: text });
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      
      speak(data.reply);
      
      if (data.finished) {
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to continue interview");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071026] text-white flex flex-col items-center justify-center px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold mb-6">Voice AI Interview</h1>

      {!started ? (
        <div className="bg-[#101828] p-8 rounded-2xl shadow-xl border border-gray-700/50 flex flex-col items-center">
          <label className="mb-4 cursor-pointer bg-white/5 border border-white/10 px-6 py-4 rounded-xl shadow hover:bg-white/10 transition">
            <span className="text-gray-300 font-medium">1. Upload Resume (PDF)</span>
            <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
          </label>
          {resumeText && <p className="text-sm text-green-400 mb-4">✓ Resume loaded.</p>}

          <button
            onClick={startInterview}
            disabled={!resumeText}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition ${
              resumeText ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105" : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            2. Start Interview
          </button>
        </div>
      ) : (
        <>
          {/* Avatar UI */}
          <div className="relative flex items-center justify-center mt-10 mb-8 min-h-[200px]">
            {/* Pulsing ring when AI speaks */}
            {isSpeaking && (
               <div className="absolute w-40 h-40 bg-pink-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
            )}
            
            <div className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center text-4xl shadow-2xl transition duration-500 ${
              isSpeaking ? "border-pink-400 bg-pink-500/20 scale-110" : "border-gray-500 bg-gray-800"
            }`}>
              {isSpeaking ? "🤖" : "🎙️"}
            </div>
          </div>

          <div className="mb-6 h-8 text-center">
            {isSpeaking ? (
               <span className="text-pink-400 font-semibold animate-pulse">AI is speaking...</span>
            ) : isTyping ? (
               <span className="text-cyan-400 font-semibold animate-pulse">AI is thinking...</span>
            ) : isListening ? (
               <span className="text-green-400 font-semibold flex items-center justify-center gap-2">
                 <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                 Listening to you...
               </span>
            ) : !evaluation ? (
               <span className="text-gray-400">Waiting for your response. Press the button below.</span>
            ) : null}
          </div>

          {!evaluation && (
            <div className="flex flex-col items-center mb-8">
              <button 
                onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
                disabled={isSpeaking || isTyping}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition transform ${
                   isSpeaking || isTyping ? "bg-gray-700 opacity-50 cursor-not-allowed" 
                   : isListening ? "bg-red-500 hover:scale-105 hover:bg-red-600" 
                   : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-110"
                }`}
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isListening ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
              <p className="text-xs text-gray-500 mt-3">{isListening ? "Tap to stop" : "Tap to answer"}</p>
            </div>
          )}

          <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-xl p-4 h-64 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {messages.map((message, index) => (
              <div key={index} className={`max-w-[80%] p-3 rounded-xl text-sm ${
                message.role === "user" ? "bg-cyan-600 ml-auto text-right" : "bg-white/10 mr-auto"
              }`}>
                {message.content}
              </div>
            ))}
          </div>

          {evaluation && (
            <div className="w-full max-w-2xl mt-8 p-6 bg-[#101828] border border-gray-700/40 rounded-xl shadow-2xl">
              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
                Interview Completed
              </h2>
              <div className="mb-6 bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 font-semibold mb-2">Overall Score</p>
                <div className="w-full bg-gray-900 rounded-full h-4">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-4 rounded-full" style={{ width: `${evaluation.score}%` }}></div>
                </div>
                <p className="text-right text-sm mt-1 font-bold">{evaluation.score} / 100</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <p className="text-green-400 font-semibold mb-2">Strengths</p>
                  <ul className="list-disc pl-5 text-sm text-green-300 space-y-1">
                    {evaluation.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <p className="text-red-400 font-semibold mb-2">Areas for Improvement</p>
                  <ul className="list-disc pl-5 text-sm text-red-300 space-y-1">
                    {evaluation.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
              
              {evaluation.improvementsFromLast && (
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 mt-4">
                  <p className="text-purple-400 font-semibold">Progress Snapshot</p>
                  <p className="text-sm text-gray-300 mt-1 italic">"{evaluation.improvementsFromLast}"</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceInterviewPage;
