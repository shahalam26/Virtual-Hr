// src/components/Stats.jsx
export default function Stats() {
  const stats = [
    {
      value: "50,000+",
      label: "Interviews Completed",
      icon: "✔️",
      color: "text-cyan-400",
    },
    {
      value: "95%",
      label: "Success Rate",
      icon: "🏆",
      color: "text-purple-400",
    },
    {
      value: "500+",
      label: "Companies Trust Us",
      icon: "🏢",
      color: "text-pink-400",
    },
    {
      value: "24/7",
      label: "AI Availability",
      icon: "⏰",
      color: "text-pink-500",
    },
    {
      value: "15 Min",
      label: "Average Interview",
      icon: "⏱️",
      color: "text-green-400",
    },
    {
      value: "85%",
      label: "Job Placement Rate",
      icon: "💼",
      color: "text-yellow-400",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white">Trusted by Thousands</h2>
          <p className="mt-4 text-lg text-gray-300">
            Join the growing community of professionals who have transformed their career prospects
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center hover:scale-105 transition-transform duration-300"
            >
              {/* Icon */}
              <div className={`text-3xl mb-2 ${stat.color}`}>{stat.icon}</div>

              {/* Value */}
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>

              {/* Label */}
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
