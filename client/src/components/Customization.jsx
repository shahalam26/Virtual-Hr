import React from "react";
import { FileText, Play, Settings, Clock } from "lucide-react";

const Customization = () => {
  const features = [
    {
      title: "Industry-Specific Questions",
      description:
        "Tailored questions for tech, finance, healthcare, marketing, and 20+ other industries.",
      icon: <FileText className="w-6 h-6" />,
      bg: "bg-blue-600",
    },
    {
      title: "Difficulty Levels",
      description:
        "Choose from beginner, intermediate, or advanced question sets based on your experience.",
      icon: <Play className="w-6 h-6" />,
      bg: "bg-purple-600",
    },
    {
      title: "Custom Question Sets",
      description:
        "Create personalized interview scenarios based on specific job descriptions or companies.",
      icon: <Settings className="w-6 h-6" />,
      bg: "bg-green-600",
    },
    {
      title: "Flexible Duration",
      description:
        "Practice sessions from 15 minutes to 2 hours, fitting your schedule perfectly.",
      icon: <Clock className="w-6 h-6" />,
      bg: "bg-orange-600",
    },
  ];

  return (
    <div className="bg-black text-white pt-24 px-6 mb-24">
      {/* Header */}
      <div className="text-center mb-12">
        <button className="px-6 py-2 rounded-full bg-purple-900 text-purple-300 mb-4">
          Customization
        </button>
        <h1 className="text-4xl font-bold mb-4">Tailored to Your Needs</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Personalize your interview experience with industry-specific content and flexible options
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-8 rounded-2xl bg-gray-900 shadow-lg hover:scale-105 transition-transform"
          >
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-lg text-white ${feature.bg} mb-6`}
            >
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customization;
