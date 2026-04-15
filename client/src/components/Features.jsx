// src/components/HowItWorks.jsx
export default function Features() {
  const steps = [
    {
      id: 1,
      title: "Create Profile",
      desc: "Set up your professional profile with personal details and preferences",
      icon: "👤⚙️",
      color: "from-cyan-400 to-blue-500",
    },
    {
      id: 2,
      title: "Upload Resume",
      desc: "Upload your resume for AI analysis and personalized question generation",
      icon: "📄",
      color: "from-purple-400 to-pink-500",
    },
    {
      id: 3,
      title: "Take Interview",
      desc: "Choose from Chat, Voice, or Avatar mode for your interview experience",
      icon: "🎤",
      color: "from-pink-500 to-violet-500",
    },
    {
      id: 4,
      title: "Get Report",
      desc: "Receive detailed feedback and improvement suggestions instantly",
      icon: "📊",
      color: "from-red-400 to-pink-500",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Experience the future of interview preparation with our advanced AI technology
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-8 shadow transition-transform transform hover:scale-105 hover:shadow-2xl duration-300"
            >
              {/* Number Circle */}
              <div
                className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-lg`}
              >
                {step.id}
              </div>

              {/* Icon */}
              <div className="mt-6 text-3xl text-center">{step.icon}</div>

              {/* Title */}
              <h3 className="mt-6 text-xl font-semibold text-center">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-center text-gray-400 text-sm">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
