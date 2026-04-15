import React, { useState } from "react";
import { FileText, Search, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";

const ToolsSection = () => {
  const [showInterviews, setShowInterviews] = useState(false);
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const navigate = useNavigate();
  const MotionHeading = motion.h2;
  const MotionText = motion.p;
  const MotionCard = motion.div;

  const cardData = [
    {
      title: "Resume Builder",
      description:
        "Create professional resumes with AI-powered suggestions and smart formatting",
      icon: <FileText className="w-12 h-12 text-orange-400" />,
      link: "#",
    },
    {
      title: "Resume Analyzer",
      description:
        "Get detailed feedback and optimization tips for your existing resume",
      icon: <Search className="w-12 h-12 text-pink-400" />,
      link: "/resumeFeedback",
    },
    {
      title: "AI Interviewer",
      description:
        "Practice interviews with AI in text, voice, or video avatar modes",
      icon: <Bot className="w-12 h-12 text-blue-400" />,
      expandable: true,
    },
  ];

  return (
    <section className="pt-28 pb-16 text-center bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Heading */}
      <MotionHeading
        className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Choose Your Tool
      </MotionHeading>

      {/* Subtitle */}
      <MotionText
        className="text-gray-400 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Access our powerful AI-driven tools to enhance your job search journey
      </MotionText>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {cardData.map((card, idx) =>
          card.expandable ? (
            // AI Interviewer expandable card
            <MotionCard
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`relative rounded-2xl p-6 flex flex-col items-center
                bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg
                hover:shadow-pink-500/20 hover:border-pink-400/30 transition-all duration-300 cursor-pointer
                ${showInterviews ? "h-auto pb-6" : "h-80"}`}
              onClick={() => isMobile && setShowInterviews((p) => !p)}
              onMouseEnter={() => !isMobile && setShowInterviews(true)}
              onMouseLeave={() => !isMobile && setShowInterviews(false)}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 shadow-inner">
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="mt-4 text-xl font-bold">{card.title}</h3>

              {/* Description */}
              <p className="text-gray-300 text-sm text-center px-2 mb-4">
                {card.description}
              </p>

              {/* Dropdown links */}
              {showInterviews && (
                <MotionCard
                  className="flex flex-col gap-3 w-full px-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                     onClick={() => navigate("/chat")}  
                    className="py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-sm hover:bg-blue-600/70 transition"
                  >
                    Text Interview
                  </button>
                  <button
                    onClick={() => navigate("/interview/voice")}
                    className="py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-sm hover:bg-blue-600/70 transition"
                  >
                    Voice Interview
                  </button>
                  <button
                    onClick={() => navigate("/interview/video")}
                    className="py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-sm hover:bg-blue-600/70 transition"
                  >
                    Video Interview
                  </button>
                </MotionCard>
              )}
            </MotionCard>
          ) : (
            // Normal cards
            <MotionCard
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative h-80 rounded-2xl p-6 flex flex-col items-center justify-between
                bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg
                hover:shadow-pink-500/20 hover:border-pink-400/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 shadow-inner">
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="mt-4 text-xl font-bold">{card.title}</h3>

              {/* Description */}
              <p className="text-gray-300 text-sm text-center px-2">
                {card.description}
              </p>

              {/* Explore button */}
              <button
                onClick={() => navigate(card.link)}
                className="mt-4 inline-block px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-pink-500/40 transition"
              >
                Explore
              </button>
            </MotionCard>
          )
        )}
      </div>
    </section>
  );
};

export default ToolsSection;
