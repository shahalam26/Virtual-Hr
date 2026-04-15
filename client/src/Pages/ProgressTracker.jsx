import React, { useEffect, useState } from "react";
import api from "../apiClient";

const ProgressTracker = () => {
  const [resumeHistory, setResumeHistory] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const resResume = await api.get("/resume/history");
        setResumeHistory(resResume.data);
        
        const resInterview = await api.get("/api/interview/history");
        setInterviewHistory(resInterview.data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="min-h-screen text-white pt-32 text-center">Loading progress...</div>;

  return (
    <div className="min-h-screen bg-[#071026] text-white pt-28 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 mb-10 text-center">
          My Progress Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Resumes Tracker */}
          <div>
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-6 shadow-sm"><span className="text-pink-400">Resume</span> Timeline</h2>
            {resumeHistory.length === 0 ? (
              <p className="text-gray-400">No resumes analyzed yet.</p>
            ) : (
              <div className="space-y-6">
                {resumeHistory.map((item, idx) => (
                  <div key={item._id} className="p-5 bg-[#101828] border border-gray-700 rounded-xl shadow-lg hover:border-pink-500/50 transition">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-lg bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full">{item.score}/100</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{item.summary}</p>
                    {item.weaknesses?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-red-400 font-semibold">Weaknesses:</span> {item.weaknesses.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interviews Tracker */}
          <div>
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-6 shadow-sm"><span className="text-cyan-400">Interview</span> Timeline</h2>
            {interviewHistory.length === 0 ? (
              <p className="text-gray-400">No interviews completed yet.</p>
            ) : (
              <div className="space-y-6">
                {interviewHistory.map((item, idx) => (
                  <div key={item._id} className="p-5 bg-[#101828] border border-gray-700 rounded-xl shadow-lg hover:border-cyan-500/50 transition">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-lg bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full">Score: {item.score}/100</span>
                    </div>
                    
                    {item.improvementsFromLast && (
                       <p className="text-sm text-purple-300 italic mb-3">"{item.improvementsFromLast}"</p>
                    )}
                    
                    {item.bodyLanguage?.score && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-indigo-400 font-semibold">Body Language & Confidence</span>
                          <span className="text-sm text-indigo-300">{item.bodyLanguage.score}/100</span>
                        </div>
                        <p className="text-xs text-gray-400">{item.bodyLanguage.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
