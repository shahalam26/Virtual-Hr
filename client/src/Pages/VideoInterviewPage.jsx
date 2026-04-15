import React, { useEffect, useRef, useState } from "react";
import api from "../apiClient";
import { extractTextFromPdf } from "../utils/pdf";

const VideoInterviewPage = () => {
  const [messages, setMessages] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [started, setStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  
  const [input, setInput] = useState("");
  
  // Video and Recording states
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);

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

  const stopRecordingAndAnalyze = async (interviewId) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Stop all tracks to turn off camera light
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
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
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to start interview");
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");

    try {
      setIsTyping(true);
      const { data } = await api.post("/api/interview/reply", { message: text });
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      
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

  return (
    <div className="min-h-screen bg-[#071026] text-white pt-24 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Video AI Interview</h1>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        
        {/* Left Side: Camera feed */}
        <div className="w-full md:w-1/2 flex flex-col items-center bg-[#101828] rounded-2xl p-4 border border-gray-700/40">
           <video 
             ref={videoRef} 
             autoPlay 
             muted 
             playsInline
             className="w-full h-auto bg-black rounded-xl mb-4 object-cover"
             style={{ minHeight: '300px' }}
           ></video>
           
           {!started && (
             <div className="flex gap-4">
               <label className="cursor-pointer bg-white/10 px-4 py-2 rounded shadow hover:bg-white/20 transition">
                  Upload Resume
                 <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
               </label>
               <button
                 onClick={startInterview}
                 className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md hover:opacity-90 transition font-medium"
               >
                 Start Interview
               </button>
             </div>
           )}
           {resumeText && !started && <p className="mt-2 text-sm text-gray-400">Resume uploaded.</p>}
           
           {isRecording && <p className="mt-2 text-sm text-red-500 font-bold animate-pulse">● Recording</p>}
           {analyzingVideo && <p className="mt-2 text-sm text-blue-400 animate-pulse">Evaluating body language...</p>}
           
           {videoAnalysis && (
              <div className="w-full mt-4 p-4 bg-gray-800/80 rounded-lg border border-indigo-500/30">
                 <h3 className="text-indigo-300 font-bold mb-2">Body Language \u0026 Confidence</h3>
                 <p className="text-2xl font-bold">{videoAnalysis.score} / 100</p>
                 <p className="text-sm text-gray-300 mt-2">{videoAnalysis.feedback}</p>
              </div>
           )}
        </div>

        {/* Right Side: Chat & Evaluation */}
        <div className="w-full md:w-1/2 shadow-lg bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col h-[70vh]">
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 custom-scrollbar">
            {messages.length === 0 && <p className="text-center text-gray-400 mt-10">Upload resume and start to begin chatting.</p>}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl max-w-[85%] text-sm ${
                  message.role === "user" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white ml-auto" : "bg-white/10 mr-auto"
                }`}
              >
                {message.content}
              </div>
            ))}

            {isTyping && <div className="text-sm text-gray-400 italic">AI is evaluating...</div>}
            
            {evaluation && (
               <div className="mt-4 p-5 bg-[#0f172a] rounded-xl border border-gray-700/50 text-sm">
                 <h2 className="text-lg font-bold text-cyan-400 mb-3">Interview Overview</h2>
                 <p className="text-gray-300 mb-2">Overall Quality Score: <span className="font-bold text-white">{evaluation.score}/100</span></p>
                 <div className="mb-2">
                   <span className="text-green-400 font-semibold">Strengths:</span>
                   <ul className="list-disc pl-5 text-gray-300">{evaluation.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                 </div>
                 <div className="mb-2">
                   <span className="text-red-400 font-semibold">Improvement Areas:</span>
                   <ul className="list-disc pl-5 text-gray-300">{evaluation.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}</ul>
                 </div>
                 {evaluation.improvementsFromLast && (
                   <p className="text-purple-300 italic mt-3 border-t border-gray-700 pt-2">{evaluation.improvementsFromLast}</p>
                 )}
               </div>
            )}
          </div>

          {!evaluation && (
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={started ? "Type response..." : ""}
                disabled={!started || isTyping}
                className="flex-1 bg-transparent border border-gray-600 rounded-full px-4 py-2 text-white outline-none"
              />
              <button 
                onClick={sendMessage}
                disabled={!started || !input.trim() || isTyping}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-semibold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoInterviewPage;
