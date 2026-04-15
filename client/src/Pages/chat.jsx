// import { useState } from "react";
// import axios from "axios";
// import * as pdfjsLib from "pdfjs-dist";

// // PDF Worker setup
// import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
// import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

// GlobalWorkerOptions.workerSrc = pdfWorker;


// function Chat() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [resumeText, setResumeText] = useState("");
//   const [started, setStarted] = useState(false);
//   const userId = "user123"; // 👈 Later replace with logged-in userId

//   // Extract text from uploaded PDF
//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = async () => {
//       const typedarray = new Uint8Array(reader.result);
//       const pdf = await pdfjsLib.getDocument(typedarray).promise;
//       let text = "";
//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const content = await page.getTextContent();
//         text += content.items.map((item) => item.str).join(" ") + "\n";
//       }
//       setResumeText(text);
//       alert("✅ Resume text extracted!");
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   // Start Interview
//   const startInterview = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/start-interview", {
//         resumeText,
//         userId
//       });
//       setMessages([{ role: "assistant", content: res.data.reply }]);
//       setStarted(true);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Send chat message
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     setMessages(newMessages);
//     setInput("");

//     try {
//       const res = await axios.post("http://localhost:5000/api/interview", {
//         userId,
//         message: input
//       });

//       const aiReply = res.data.reply;
//       setMessages([...newMessages, { role: "assistant", content: aiReply }]);
//     } catch (err) {
//         console.log(err.message)
//       console.error(err);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-4 flex flex-col">
//         <h1 className="text-xl font-bold text-center mb-4">🤖 AI HR Interview</h1>

//         {!started ? (
//           <div className="space-y-3">
//             <input type="file" accept="application/pdf" onChange={handleFileUpload} />
//             <button
//               onClick={startInterview}
//               disabled={!resumeText}
//               className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
//             >
//               Start Interview
//             </button>
//           </div>
//         ) : (
//           <>
//             {/* Chat Box */}
//             <div className="flex-1 overflow-y-auto mb-3 border p-3 rounded-lg bg-gray-50 h-96">
//               {messages.map((msg, i) => (
//                 <div
//                   key={i}
//                   className={`my-2 p-2 rounded-lg max-w-[80%] ${
//                     msg.role === "user"
//                       ? "bg-blue-500 text-white ml-auto"
//                       : "bg-gray-200 text-black mr-auto"
//                   }`}
//                 >
//                   {msg.content}
//                 </div>
//               ))}
//             </div>

//             {/* Input Box */}
//             <div className="flex">
//               <input
//                 type="text"
//                 className="flex-1 border p-2 rounded-l-lg outline-none"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                 placeholder="Type your response..."
//               />
//               <button
//                 onClick={sendMessage}
//                 className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
//               >
//                 Send
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Chat;
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

// PDF Worker setup
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [started, setStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // UI-only: show typing indicator
  const userId = "user123"; // later replace with logged-in userId

  const chatRef = useRef(null);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Extract text from uploaded PDF
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

  // Start Interview
  const startInterview = async () => {
    try {
      setIsTyping(true);
      const res = await axios.post(
        "http://localhost:5000/api/start-interview",
        { resumeText, userId },
        { withCredentials: true } // ✅ added
      );
      setMessages([{ role: "assistant", content: res.data.reply }]);
      setStarted(true);
    } catch (err) {
      console.log(err.message);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Send chat message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      setIsTyping(true);
      const res = await axios.post(
        "http://localhost:5000/api/interview",
        { userId, message: input },
        { withCredentials: true } // ✅ added
      );

      const aiReply = res.data.reply;
      setMessages([...newMessages, { role: "assistant", content: aiReply }]);
    } catch (err) {
      console.log(err?.message || err);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // small typing indicator component (three bouncing dots)
  const TypingIndicator = () => (
    <div className="flex items-center gap-3 py-2 px-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow">
        🤖
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
        {/* Header card */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI HR Interview</h1>
            <p className="text-sm text-gray-300">
              Upload your resume and start a mock interview — reply to AI prompts in chat.
            </p>
          </div>

          {/* Resume file info */}
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
                <svg className="w-4 h-4 opacity-90" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 7l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 21H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-gray-200">
                  {resumeText ? "Uploaded" : "Upload PDF"}
                </span>
              </label>
              {resumeText && (
                <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                  <span className="text-gray-200">Extracted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/8 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-white/6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow">
                🤖
              </div>
              <div>
                <div className="font-semibold">AI Interview Bot</div>
                <div className="text-xs text-gray-300">Realistic HR-style questions</div>
              </div>
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

          {/* Chat area */}
          <div
            ref={chatRef}
            className="p-4 h-[60vh] md:h-[66vh] overflow-y-auto space-y-3 bg-gradient-to-b from-transparent to-black/20"
          >
            {messages.length === 0 && !isTyping && (
              <div className="text-center text-gray-400 mt-8">
                Waiting to start — upload resume and press <span className="font-medium text-gray-200">Start Interview</span>.
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] break-words px-4 py-3 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white ml-auto"
                    : "bg-white/6 text-gray-200 mr-auto"
                }`}
              >
                <div className="text-sm leading-relaxed">{msg.content}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-white/6 bg-gradient-to-t from-black/20 to-transparent">
            <div className="flex gap-3 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

        <style>
          {`
            /* typing dots animation tweaks */
            .typing-dot { animation: typingBounce 1s infinite; }
            .typing-dot.animate-bounce200 { animation-delay: 0.15s; }
            .typing-dot.animate-bounce300 { animation-delay: 0.3s; }
            @keyframes typingBounce {
              0% { transform: translateY(0); opacity: .6; }
              50% { transform: translateY(-6px); opacity: 1; }
              100% { transform: translateY(0); opacity: .6; }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default Chat;
