import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../apiClient";
import { extractTextFromPdf } from "../utils/pdf";

const VideoInterviewPage = () => {
  const [messages, setMessages] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [started, setStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Video and Recording states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);

  // Frame capture state for multimodal AI
  const capturedFramesRef = useRef([]);
  const frameIntervalRef = useRef(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Could not access camera/microphone.");
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    // Limit to 3 frames per answer to avoid payload size issues
    if (capturedFramesRef.current.length >= 3) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64, dropping the data:image/jpeg;base64, prefix for easier backend handling
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    capturedFramesRef.current.push(base64Image);
  };

  const startFrameCapture = () => {
    capturedFramesRef.current = [];
    captureFrame(); // Capture immediately when listening starts
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    frameIntervalRef.current = setInterval(captureFrame, 2000); // Capture every 2 seconds
  };
  
  const stopFrameCapture = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
  };


  const stopRecordingAndAnalyze = async (interviewId) => {
    stopFrameCapture();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Stop all tracks to turn off camera light
        const stream = videoRef.current.srcObject;
        if (stream) {
           const tracks = stream.getTracks();
           tracks.forEach(track => track.stop());
        }
        
        // Upload video
        setAnalyzingVideo(true);
        const formData = new FormData();
        formData.append("video", blob, "interview.webm");
        formData.append("interviewId", interviewId);

        try {
          const { data } = await api.post("/api/interview/analyze-video", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          setVideoAnalysis(data.bodyLanguage);
        } catch (error) {
          console.error("Video upload error:", error);
          alert("Failed to analyze body language.");
        } finally {
          setAnalyzingVideo(false);
        }
      };
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const [voices, setVoices] = useState([]);
  const [videoAvatarFailed, setVideoAvatarFailed] = useState(false);

  // Load voices on mount and when they change
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
       stopFrameCapture();
       recognitionRef.current?.stop();
       window.speechSynthesis?.cancel();
    }
  }, []);

  const speak = (text, isFinished = false) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.pitch = 1.1; // Slightly higher pitch for more humanoid/natural tone
    speech.rate = 1.0;
    
    // Find a proper female voice
    const femaleVoice = voices.find(v => 
      v.name.includes("Google UK English Female") || 
      v.name.includes("Google US English") || 
      v.name.includes("Zira") || 
      v.name.includes("Samantha") ||
      (v.name.toLowerCase().includes("female") && v.lang.startsWith("en"))
    );
    
    if (femaleVoice) {
      speech.voice = femaleVoice;
    }

    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => {
       setIsSpeaking(false);
       // Auto-start listening after AI finishes speaking to feel like a real conversation
       if (!isFinished) {
           setTimeout(() => {
               try {
                   startListening();
               } catch (err) {
                   console.log("Could not auto-start listening", err);
               }
           }, 500);
       }
    };
    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition is not supported in this browser. Please use Chrome/Edge.");

    recognitionRef.current?.stop();
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      startFrameCapture();
    };
    recognition.onerror = () => {
      setIsListening(false);
      stopFrameCapture();
    };
    recognition.onend = () => {
      setIsListening(false);
      stopFrameCapture();
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) sendMessage(transcript);
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
    if (!resumeText) return alert("Upload resume first");
    
    await startWebcam();
    
    try {
      setIsTyping(true);
      const { data } = await api.post("/api/interview/start", { resumeText });
      setMessages([{ role: "assistant", content: data.reply }]);
      setStarted(true);
      speak(data.reply);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to start interview");
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text) return;
    
    stopFrameCapture();
    const frames = capturedFramesRef.current;

    setMessages(prev => [...prev, { role: "user", content: text }]);

    try {
      setIsTyping(true);
      const { data } = await api.post("/api/interview/reply", { 
        message: text,
        images: isRecording ? frames : undefined 
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      speak(data.reply, data.finished);
      
      capturedFramesRef.current = [];
      
      if (data.finished) {
        setEvaluation(data.evaluation);
        if (data.interviewId) {
           stopRecordingAndAnalyze(data.interviewId);
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to continue interview");
    } finally {
      setIsTyping(false);
    }
  };

  const getLatestAiMessage = () => {
    const aiMessages = messages.filter(m => m.role === "assistant");
    if (aiMessages.length === 0) return "";
    return aiMessages[aiMessages.length - 1].content;
  };

  return (
    <div className="min-h-screen bg-[#071026] text-white pt-24 px-4 flex flex-col items-center pb-10">
      <h1 className="text-3xl font-bold mb-8">Live AI Interview</h1>

      <div className="w-full max-w-6xl flex flex-col gap-8">
        
        {/* Video Grid (Top) */}
        {!evaluation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
           {/* Dynamic AI Interviewer Avatar */}
           <div className="flex flex-col items-center justify-center bg-[#101828] rounded-3xl p-2 border border-gray-700/40 relative shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden w-full" style={{ minHeight: '350px', maxHeight: '450px' }}>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                 <motion.div 
                    animate={{ scale: isSpeaking ? [1, 1.5, 1] : 1, opacity: isSpeaking ? [0.1, 0.3, 0.1] : 0.1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute w-64 h-64 rounded-full border border-indigo-400"
                 />
                 <motion.div 
                    animate={{ scale: isSpeaking ? [1, 2, 1] : 1.2, opacity: isSpeaking ? [0.1, 0.2, 0.1] : 0.05 }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute w-96 h-96 rounded-full border border-cyan-400"
                 />
              </div>

              <motion.div 
                animate={{ 
                   scale: isSpeaking ? [1, 1.1, 1] : 1,
                   boxShadow: isSpeaking 
                     ? ["0px 0px 20px rgba(99,102,241,0.5)", "0px 0px 60px rgba(99,102,241,0.8)", "0px 0px 20px rgba(99,102,241,0.5)"]
                     : "0px 0px 20px rgba(99,102,241,0.2)"
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 via-cyan-400 to-teal-300 flex items-center justify-center z-10 relative"
              >
                <div className="w-28 h-28 rounded-full bg-[#0a0f1d] flex items-center justify-center">
                   <motion.div 
                     animate={{ 
                       scale: isTyping ? [1, 0.8, 1] : isSpeaking ? [1, 1.3, 0.9, 1.2, 1] : 1,
                       rotate: isTyping ? 360 : 0,
                       borderRadius: isSpeaking ? ["50%", "40%", "60%", "50%"] : "50%"
                     }}
                     transition={{ repeat: Infinity, duration: isTyping ? 2 : 0.5 }}
                     className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-indigo-500 blur-[2px]"
                   />
                </div>
              </motion.div>

              <div className="absolute bottom-12 flex flex-col items-center">
                <span className="text-cyan-400 font-medium tracking-widest uppercase text-xs mb-2 shadow-black drop-shadow-md">
                   {isSpeaking ? "Transmitting" : isTyping ? "Analyzing" : "Standby"}
                </span>
                <div className="flex gap-1.5">
                   {[...Array(5)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={isSpeaking || isTyping ? { height: ["4px", `${Math.random() * 16 + 8}px`, "4px"] } : { height: "4px" }}
                       transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                       className="w-1.5 bg-cyan-400 rounded-full"
                     />
                   ))}
                </div>
              </div>

              <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full shadow-lg border border-white/10 z-10">
                <span className="text-white text-sm font-bold flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-indigo-400 animate-pulse' : 'bg-green-400'}`}></div> AI Interview Agent {isSpeaking && "(Speaking)"}
                </span>
              </div>
           </div>

          {/* User Camera feed */}
          <div className="w-full flex flex-col items-center bg-[#101828] rounded-3xl p-2 border border-gray-700/40 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
             {/* UI Improvements: Real-time Emoticon Badge */}
             {isRecording && (
               <div className="absolute top-6 left-6 flex items-center justify-between w-[calc(100%-3rem)] z-10">
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full animate-pulse font-medium backdrop-blur-sm shadow-lg">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> 
                    <span className="text-sm tracking-widest">REC</span>
                  </div>

                  {/* Real-time emotion is now processed silently by the backend AI */}
               </div>
             )}

             <video 
               ref={videoRef} 
               autoPlay 
               muted 
               playsInline
               className={`w-full h-auto rounded-[1.3rem] object-cover border-2 transition-all duration-300 ${isRecording ? 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-transparent bg-black/50'}`}
               style={{ minHeight: '350px', maxHeight: '450px' }}
             ></video>
             <canvas ref={canvasRef} className="hidden"></canvas>
             
             <div className="absolute bottom-6 right-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full shadow-lg border border-white/10 z-10">
               <span className="text-white text-sm font-bold flex items-center gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-indigo-400' : 'bg-gray-500'}`}></div> You
               </span>
             </div>
             
             {!started && (
               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 rounded-[1.3rem] m-2 backdrop-blur-sm">
                 <div className="flex flex-col gap-5 items-center max-w-sm text-center">
                   <div className="mb-2">
                     <h3 className="text-2xl font-bold mb-2">Ready for your Interview?</h3>
                     <p className="text-gray-400 text-sm">Upload your resume. The AI will analyze it to tailor your custom questions.</p>
                   </div>
                   
                   <label className="cursor-pointer bg-white/10 px-8 py-4 rounded-xl shadow-lg hover:bg-white/20 transition backdrop-blur-sm font-semibold border border-white/10 flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Upload Resume PDF
                     <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                   </label>
                   
                   {resumeText && <p className="text-sm text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-lg">✨ Resume uploaded successfully.</p>}
                   
                   <button
                     onClick={startInterview}
                     className="px-10 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all font-bold tracking-wide text-lg w-full mt-2"
                     disabled={!resumeText}
                     style={{ opacity: resumeText ? 1 : 0.4 }}
                   >
                     Start Live Interview
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
        )}

        {/* Video Analysis Result Card (shown briefly at end or if full video analysis finishes) */}
        {analyzingVideo && <p className="text-center text-sm text-blue-400 animate-pulse font-medium">Evaluating total body language profile...</p>}
        {videoAnalysis && (
            <div className="w-full mt-2 p-4 bg-indigo-900/40 rounded-xl border border-indigo-500/30 flex justify-between items-center">
               <div>
                 <h3 className="text-indigo-300 font-bold mb-1">Body Language \u0026 Confidence Snapshot</h3>
                 <p className="text-sm text-gray-300">{videoAnalysis.feedback}</p>
               </div>
               <div className="text-3xl font-black text-indigo-400 bg-indigo-950/50 px-4 py-2 rounded-lg border border-indigo-500/20">
                 {videoAnalysis.score}
               </div>
            </div>
        )}

        {/* Evaluation View (Only shows when interview is done) */}
        {evaluation && (
           <div className="w-full mt-4 p-8 bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] rounded-3xl border border-indigo-500/40 shadow-2xl">
             <div className="flex items-center justify-between mb-8 border-b border-gray-700/50 pb-6">
               <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Final Interview Evaluation</h2>
               <div className="flex flex-col items-center">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Overall Score</span>
                 <div className="text-4xl font-black text-cyan-400 bg-cyan-950/50 px-6 py-2 rounded-xl border border-cyan-500/20">{evaluation.score}<span className="text-2xl text-cyan-500/50">/100</span></div>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
               <div className="bg-green-900/10 p-6 rounded-2xl border border-green-500/20 shadow-inner">
                 <span className="text-green-400 font-bold text-xl mb-4 flex items-center gap-2"><span className="text-2xl bg-green-500/20 w-8 h-8 rounded-full flex items-center justify-center">✓</span> Your Strengths</span>
                 <ul className="list-disc pl-5 text-gray-300 space-y-2 text-md leading-relaxed">{evaluation.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
               </div>
               <div className="bg-red-900/10 p-6 rounded-2xl border border-red-500/20 shadow-inner">
                 <span className="text-red-400 font-bold text-xl mb-4 flex items-center gap-2"><span className="text-2xl bg-red-500/20 w-8 h-8 rounded-full flex items-center justify-center">!</span> Areas to Improve</span>
                 <ul className="list-disc pl-5 text-gray-300 space-y-2 text-md leading-relaxed">{evaluation.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}</ul>
               </div>
             </div>
             
             {evaluation.improvementsFromLast && (
               <div className="bg-purple-900/10 p-6 rounded-2xl border border-purple-500/20 mt-4">
                 <p className="text-purple-300 italic text-lg leading-relaxed">⭐ <span className="font-semibold text-purple-200">Progress Tracker:</span> {evaluation.improvementsFromLast}</p>
               </div>
             )}
           </div>
        )}

        {/* Video Call Controls & Subtitles Layer */}
        {!evaluation && (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl bg-[#0a0f1d] p-6 rounded-[2rem] border border-gray-700/50 shadow-2xl flex flex-col items-center">
              
              {/* Intelligent Subtitles Box */}
              <div className="min-h-[100px] w-full bg-black/40 rounded-2xl p-4 flex items-center justify-center text-center mb-6 border border-white/5">
                 {isSpeaking ? (
                   <p className="text-pink-100 text-lg md:text-xl font-medium max-w-3xl leading-relaxed">"{getLatestAiMessage()}"</p>
                 ) : isTyping ? (
                   <p className="text-indigo-400 text-lg animate-pulse font-medium">The AI is analyzing your response...</p>
                 ) : isListening ? (
                   <div className="flex flex-col items-center">
                     <p className="text-green-400 text-xl font-bold animate-pulse mb-2">Listening...</p>
                     <p className="text-gray-400 text-sm">Please speak clearly into your microphone.</p>
                   </div>
                 ) : started ? (
                   <p className="text-gray-300 text-lg font-medium">It's your turn. Tap the microphone when you are ready to speak.</p>
                 ) : (
                   <p className="text-gray-500">Waiting for interview to begin.</p>
                 )}
              </div>

              {/* Call Controls */}
              <div className="flex gap-6 items-center">
                 <button 
                  onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
                  disabled={!started || isSpeaking || isTyping}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                     !started || isSpeaking || isTyping ? "bg-gray-800 border-2 border-gray-700 opacity-30 cursor-not-allowed" 
                     : isListening ? "bg-red-500 hover:scale-105 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse" 
                     : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border-4 border-[#0a0f1d]"
                  }`}
                >
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isListening ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VideoInterviewPage;

