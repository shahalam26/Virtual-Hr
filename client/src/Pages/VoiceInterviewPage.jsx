import { useEffect, useRef, useState } from "react";
import api from "../apiClient";
import { extractTextFromPdf } from "../utils/pdf";

const VoiceInterviewPage = () => {
  const [messages, setMessages] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [started, setStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const recognitionRef = useRef(null);
  const userId = "user123";

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  const speak = (text, onEnd) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.onend = () => onEnd?.();

    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
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
    if (!resumeText) {
      alert("Please upload resume first");
      return;
    }

    try {
      setIsTyping(true);
      const { data } = await api.post("/api/start-interview", { userId, resumeText });
      const firstQuestion = data.reply;

      setMessages([{ role: "assistant", content: firstQuestion }]);
      setStarted(true);
      speak(firstQuestion, startListening);
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
      const { data } = await api.post("/api/interview", { userId, message: text });
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      speak(data.reply, startListening);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to continue interview");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071026] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Voice AI Interview</h1>

      {!started ? (
        <>
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
          <div className="mb-4 text-sm text-gray-300">
            {isListening ? "Listening..." : isTyping ? "AI thinking..." : "Idle"}
          </div>

          <div className="w-full max-w-xl space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`p-3 rounded-xl ${
                  message.role === "user" ? "bg-pink-500 text-right" : "bg-white/10"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceInterviewPage;
