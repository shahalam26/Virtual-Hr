// src/components/Comparison.jsx
import React from "react";
import {
  XCircle,
  CheckCircle2,
  DollarSign,
  Clock,
  BarChart3,
  ShieldQuestion,
  Bell,
} from "lucide-react";

const rows = [
  {
    feature: "Interview Availability",
    trad: { text: "Limited to business hours", icon: XCircle, color: "text-red-400" },
    ai: { text: "24/7 unlimited access", icon: CheckCircle2, color: "text-emerald-400" },
  },
  {
    feature: "Immediate Feedback",
    trad: { text: "Days or weeks wait time", icon: XCircle, color: "text-red-400" },
    ai: { text: "Instant detailed analysis", icon: CheckCircle2, color: "text-emerald-400" },
  },
  {
    feature: "Cost per Interview",
    trad: { text: "$200–500+ per session", icon: XCircle, color: "text-red-400" },
    ai: { text: "Starting from $10/month", icon: CheckCircle2, color: "text-emerald-400" },
  },
  {
    feature: "Bias & Consistency",
    trad: { text: "Human bias & variability", icon: XCircle, color: "text-red-400" },
    ai: { text: "Objective AI evaluation", icon: CheckCircle2, color: "text-emerald-400" },
  },
  {
    feature: "Scalability",
    trad: { text: "Limited by human resources", icon: XCircle, color: "text-red-400" },
    ai: { text: "Unlimited concurrent users", icon: CheckCircle2, color: "text-emerald-400" },
  },
  {
    feature: "Practice Opportunities",
    trad: { text: "Few practice sessions", icon: XCircle, color: "text-red-400" },
    ai: { text: "Unlimited practice rounds", icon: CheckCircle2, color: "text-emerald-400" },
  },
  {
    feature: "Performance Tracking",
    trad: { text: "Manual notes & memory", icon: XCircle, color: "text-red-400" },
    ai: { text: "Comprehensive analytics", icon: CheckCircle2, color: "text-emerald-400" },
  },
  {
    feature: "Question Variety",
    trad: { text: "Limited question bank", icon: XCircle, color: "text-red-400" },
    ai: { text: "AI-generated infinite variety", icon: CheckCircle2, color: "text-emerald-400" },
  },
];

const Comparison = () => {
  return (
    <section className="px-6 py-20 bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white relative">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-6 py-2 mb-6 text-sm font-semibold text-orange-200 bg-gradient-to-r from-orange-800 to-orange-600 rounded-full shadow-lg">
          <ShieldQuestion size={16} />
          Traditional vs AI
        </div>
        <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
          Why Choose AI Interviewer?
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Discover how AI technology is transforming hiring with speed,
          objectivity, and scalability — leaving traditional methods behind.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-800 to-purple-600">
              <th className="px-6 py-5 text-left text-gray-100 font-semibold text-lg w-[30%]">
                Feature
              </th>
              <th className="px-6 py-5 text-left text-gray-100 font-semibold text-lg w-[35%]">
                Traditional Interviews
              </th>
              <th className="px-6 py-5 text-left text-gray-100 font-semibold text-lg w-[35%]">
                AI Interviewer
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900/80 divide-y divide-gray-800">
            {rows.map((row) => {
              const TradIcon = row.trad.icon;
              const AIcon = row.ai.icon;
              return (
                <tr key={row.feature} className="hover:bg-white/5 transition">
                  <td className="px-6 py-5 font-medium text-gray-200 text-base">
                    {row.feature}
                  </td>

                  {/* Traditional column */}
                  <td className="px-6 py-5">
                    <div className={`flex items-center gap-2 ${row.trad.color}`}>
                      <TradIcon size={20} />
                      <span className="text-gray-300 text-sm">{row.trad.text}</span>
                    </div>
                  </td>

                  {/* AI column */}
                  <td className="px-6 py-5">
                    <div className={`flex items-center gap-2 ${row.ai.color}`}>
                      <AIcon size={20} />
                      <span className="text-gray-300 text-sm">{row.ai.text}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        <div className="p-7 rounded-2xl bg-gradient-to-tr from-emerald-900/40 to-emerald-700/10 hover:scale-[1.05] transition shadow-lg">
          <DollarSign size={42} className="text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Cost Effective</h3>
          <p className="text-gray-400">
            Reduce interview costs by up to 90% while maintaining quality.
          </p>
        </div>
        <div className="p-7 rounded-2xl bg-gradient-to-tr from-sky-900/40 to-sky-700/10 hover:scale-[1.05] transition shadow-lg">
          <Clock size={42} className="text-sky-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Time Efficient</h3>
          <p className="text-gray-400">
            Schedule interviews instantly without coordination delays.
          </p>
        </div>
        <div className="p-7 rounded-2xl bg-gradient-to-tr from-purple-900/40 to-purple-700/10 hover:scale-[1.05] transition shadow-lg">
          <BarChart3 size={42} className="text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Better Results</h3>
          <p className="text-gray-400">
            Objective evaluation leads to 40% better hiring decisions.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-16">
        <button
          className="flex items-center gap-2 px-8 py-4 rounded-full 
                     bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 
                     text-white font-semibold text-lg 
                     hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:scale-[1.05]
                     transition duration-300 shadow-md"
        >
          <Bell className="w-5 h-5" />
          <span>Start Your Upgrade Today</span>
        </button>
      </div>
    </section>
  );
};

export default Comparison;
