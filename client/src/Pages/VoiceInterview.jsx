import { useState, useRef } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

// PDF worker
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

const VoiceInterview = () => {
  const [messages, setMessages] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [started, setStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const userId = "user123";

  // 🔊 SPEAK (interrupt + callback)
  const speak = (text, onEnd) => {
    window.speechSynthesis.cancel(); // stop previous speech

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;

    speech.onend = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(speech);
  };

  // 🎤 START LISTENING (with silence detection)
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    // stop old recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("User:", transcript);

      // 🔥 silence detection
      clearTimeout(silenceTimerRef.current);

      silenceTimerRef.current = setTimeout(() => {
        sendMessage(transcript);
      }, 1200); // 1.2 sec pause = send
    };

    recognition.onerror = (err) => {
      console.log("Mic error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // 📄 RESUME UPLOAD
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      setResumeText(text);
    };

    reader.readAsArrayBuffer(file);
  };

  // 🚀 START INTERVIEW
  const startInterview = async () => {
    try {
      if (!resumeText) {
        alert("Please upload resume first");
        return;
      }

      setIsTyping(true);

      const res = await axios.post(
        "http://localhost:5000/api/start-interview",
        { userId, resumeText },
        { withCredentials: true }
      );

      const firstQ = res.data.reply;

      setMessages([{ role: "assistant", content: firstQ }]);
      setStarted(true);

      // 🔥 speak + auto listen
      speak(firstQ, startListening);

    } catch (err) {
      console.log(err);
    } finally {
      setIsTyping(false);
    }
  };

  // 💬 SEND MESSAGE
  const sendMessage = async (text) => {
    if (!text) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);

    try {
      setIsTyping(true);

      const res = await axios.post(
        "http://localhost:5000/api/interview",
        { userId, message: text },
        { withCredentials: true }
      );

      const reply = res.data.reply;

      setMessages([...newMessages, { role: "assistant", content: reply }]);

      // 🔥 speak + continue loop
      speak(reply, startListening);

    } catch (err) {
      console.log(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071026] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">🎤 Voice AI Interview</h1>

      {!started ? (
        <>
          {/* Upload Resume */}
          <label className="mb-4 cursor-pointer bg-white/10 px-4 py-2 rounded">
            Upload Resume
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={startInterview}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
          >
            Start Interview
          </button>
        </>
      ) : (
        <>
          {/* STATUS */}
          <div className="mb-4 text-sm text-gray-300">
            {isListening
              ? "🎙 Listening..."
              : isTyping
              ? "🤖 AI thinking..."
              : "Idle"}
          </div>

          {/* CHAT VIEW */}
          <div className="w-full max-w-xl space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl ${
                  msg.role === "user"
                    ? "bg-pink-500 text-right"
                    : "bg-white/10"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceInterview;
