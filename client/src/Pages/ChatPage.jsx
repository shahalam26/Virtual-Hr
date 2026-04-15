import { useEffect, useRef, useState } from "react";
import api from "../apiClient";
import { extractTextFromPdf } from "../utils/pdf";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [started, setStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const userId = "user123";

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
    try {
      setIsTyping(true);
      const { data } = await api.post("/api/start-interview", { resumeText, userId });
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
    const messageText = input.trim();
    if (!messageText) return;

    const nextMessages = [...messages, { role: "user", content: messageText }];
    setMessages(nextMessages);
    setInput("");

    try {
      setIsTyping(true);
      const { data } = await api.post("/api/interview", {
        userId,
        message: messageText,
      });
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to send message");
    } finally {
      setIsTyping(false);
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-3 py-2 px-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow">
        AI
      </div>
      <div className="bg-white/6 backdrop-blur-md px-3 py-2 rounded-md">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">AI is typing</span>
          <div className="flex items-center gap-1">
            <span className="typing-dot animate-bounce bg-gray-300 rounded-full w-2 h-2 inline-block" />
            <span className="typing-dot animate-bounce200 bg-gray-300 rounded-full w-2 h-2 inline-block" />
            <span className="typing-dot animate-bounce300 bg-gray-300 rounded-full w-2 h-2 inline-block" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#071026] text-white pt-28 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI HR Interview</h1>
            <p className="text-sm text-gray-300">
              Upload your resume and start a mock interview in chat.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">Resume</div>
            <div className="mt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/8 px-3 py-2 rounded-full hover:scale-[1.02] transition">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="text-sm text-gray-200">
                  {resumeText ? "Uploaded" : "Upload PDF"}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/8 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-white/6 flex items-center justify-between">
            <div>
              <div className="font-semibold">AI Interview Bot</div>
              <div className="text-xs text-gray-300">Realistic HR-style questions</div>
            </div>

            {!started ? (
              <button
                onClick={startInterview}
                disabled={!resumeText}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  resumeText
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    : "bg-gray-700 text-gray-300 cursor-not-allowed"
                }`}
              >
                Start Interview
              </button>
            ) : (
              <div className="text-sm text-gray-300">Interview started</div>
            )}
          </div>

          <div
            ref={chatRef}
            className="p-4 h-[60vh] md:h-[66vh] overflow-y-auto space-y-3 bg-gradient-to-b from-transparent to-black/20"
          >
            {messages.length === 0 && !isTyping && (
              <div className="text-center text-gray-400 mt-8">
                Waiting to start. Upload a resume and press Start Interview.
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[80%] break-words px-4 py-3 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white ml-auto"
                    : "bg-white/6 text-gray-200 mr-auto"
                }`}
              >
                <div className="text-sm leading-relaxed">{message.content}</div>
              </div>
            ))}

            {isTyping && <TypingIndicator />}
          </div>

          <div className="p-4 border-t border-white/6 bg-gradient-to-t from-black/20 to-transparent">
            <div className="flex gap-3 items-center">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                placeholder={started ? "Type your response..." : "Start interview to enable chat"}
                className="flex-1 bg-transparent border border-white/8 rounded-full px-4 py-3 text-white outline-none placeholder:text-gray-400"
                disabled={!started}
              />
              <button
                onClick={sendMessage}
                disabled={!started || !input.trim()}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !started || !input.trim()
                    ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .typing-dot { animation: typingBounce 1s infinite; }
          .typing-dot.animate-bounce200 { animation-delay: 0.15s; }
          .typing-dot.animate-bounce300 { animation-delay: 0.3s; }
          @keyframes typingBounce {
            0% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-6px); opacity: 1; }
            100% { transform: translateY(0); opacity: 0.6; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default ChatPage;
