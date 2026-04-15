import React from "react";
import { FileText, Search, Shield, LayoutGrid } from "lucide-react";

const resumeFeatures = [
  {
    title: "AI Resume Builder",
    description:
      "Create professional resumes with AI-powered content suggestions and smart formatting",
    icon: <FileText className="w-8 h-8 text-orange-500" />,
    color: "bg-orange-600",
  },
  {
    title: "Resume Analyzer",
    description:
      "Get detailed feedback on your resume's content, structure, and areas for improvement",
    icon: <Search className="w-8 h-8 text-pink-500" />,
    color: "bg-pink-600",
  },
  {
    title: "ATS Optimization",
    description:
      "Ensure your resume passes applicant tracking systems with keyword optimization",
    icon: <Shield className="w-8 h-8 text-purple-500" />,
    color: "bg-purple-600",
  },
  {
    title: "Industry Templates",
    description:
      "Choose from professionally designed templates tailored for different industries",
    icon: <LayoutGrid className="w-8 h-8 text-indigo-500" />,
    color: "bg-indigo-600",
  },
];

const ResumeTools = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-center">
      {/* Badge */}
      <div className="inline-block px-6 py-2 mb-8 text-base font-semibold text-orange-200 bg-orange-900 rounded-full transform transition-transform duration-300 hover:scale-110">
        Resume Tools
      </div>

      {/* Heading */}
      <h2 className="mb-4 text-4xl font-bold text-white">Perfect Your Resume</h2>
      <p className="mb-12 text-lg text-gray-300">
        Build, analyze, and optimize your resume with AI-powered tools for maximum impact
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {resumeFeatures.map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-lg mb-4 ${feature.color}`}
            >
              {feature.icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeTools;
