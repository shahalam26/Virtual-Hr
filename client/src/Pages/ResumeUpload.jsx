import React, { useState } from "react";
import api from "../apiClient";
import { extractTextFromPdf } from "../utils/pdf";

export const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF");

    setLoading(true);
    setAnalysis(null);

    try {
      const text = await extractTextFromPdf(file);
      const { data } = await api.post("/resume/feedback", { text });
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert(error.response?.data?.error || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white pt-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Upload Section */}
        <div className="bg-[#101828] shadow-lg rounded-2xl p-10 text-center border border-gray-700/40">
          <h2 className="text-3xl font-bold text-purple-400 mb-6">
            Upload Your Resume
          </h2>
          <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-purple-500/40 rounded-xl p-8 bg-[#0f172a]/70 hover:bg-[#1e293b]/70 transition">
            <span className="text-purple-300 text-sm mb-2">
              Click to upload
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && (
              <p className="mt-3 text-sm text-gray-300">{file.name}</p>
            )}
          </label>
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`mt-6 px-6 py-3 font-semibold rounded-xl shadow-md transition 
              ${
                loading
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
              }`}
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="mt-12 space-y-8">
            {/* ATS Score */}
            <div className="bg-[#101828] p-6 rounded-xl shadow-md border border-gray-700/40">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                ATS Score
              </h3>
              <div className="w-full bg-gray-800 rounded-full h-5">
                <div
                  className={`h-5 rounded-full ${
                    analysis["ATS Score"] > 70
                      ? "bg-green-500"
                      : analysis["ATS Score"] > 40
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${analysis["ATS Score"]}%` }}
                ></div>
              </div>
              <p className="mt-2 text-gray-200 font-bold">
                {analysis["ATS Score"]} / 100
              </p>
            </div>

            {/* Strengths */}
            <div className="bg-[#101828] p-6 rounded-xl shadow-md border border-gray-700/40">
              <h3 className="text-xl font-semibold text-green-400 mb-3">
                Strengths
              </h3>
              <ul className="list-disc pl-5 text-green-300 space-y-1">
                {analysis.Strengths?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#101828] p-6 rounded-xl shadow-md border border-gray-700/40">
              <h3 className="text-xl font-semibold text-red-400 mb-3">
                Weaknesses
              </h3>
              <ul className="list-disc pl-5 text-red-300 space-y-1">
                {analysis.Weaknesses?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="bg-[#101828] p-6 rounded-xl shadow-md border border-gray-700/40">
              <h3 className="text-xl font-semibold text-orange-400 mb-3">
                Suggestions
              </h3>
              <ul className="list-disc pl-5 text-orange-300 space-y-1">
                {analysis.Suggestions?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Extracted Skills */}
            <div className="bg-[#101828] p-6 rounded-xl shadow-md border border-gray-700/40">
              <h3 className="text-xl font-semibold text-purple-400 mb-3">
                Extracted Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis["Extracted Skills"]?.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-purple-600/40 text-purple-200 px-3 py-1 rounded-full text-sm shadow"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#101828] p-6 rounded-xl shadow-md border border-gray-700/40">
              <h3 className="text-xl font-semibold text-pink-400 mb-3">
                Summary
              </h3>
              <p className="text-gray-200 leading-relaxed">{analysis.Summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
