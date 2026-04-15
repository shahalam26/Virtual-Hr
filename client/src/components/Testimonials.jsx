// src/components/Testimonials.jsx
export default function Testimonials() {
  const reviews = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      feedback:
        "The AI interviewer helped me practice for my Google interview. The feedback was incredibly detailed and helped me improve my communication skills significantly.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      company: "Google",
    },
    {
      name: "Marcus Rodriguez",
      role: "Data Scientist at Microsoft",
      feedback:
        "The voice interview mode felt so real! It prepared me perfectly for behavioral questions and gave me the confidence I needed for my Microsoft interview.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      company: "Microsoft",
    },
    {
      name: "Priya Sharma",
      role: "Product Manager at Amazon",
      feedback:
        "The AI analyzed my resume and created personalized questions. It gave me insights I never considered before, which really helped me stand out.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      company: "Amazon",
    },
    {
      name: "James Wilson",
      role: "UX Designer at Meta",
      feedback:
        "The avatar mode was amazing! It felt like talking to a real person. Practicing with this tool made me so much more confident in my interviews.",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      company: "Meta",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Hear from professionals who landed their dream jobs after practicing with our AI interviewer
          </p>
        </div>

        {/* Grid of Reviews */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-gray-800/50 p-8 shadow-md hover:scale-105 transition-transform duration-300"
            >
              {/* Stars */}
              <div className="flex mb-4 text-yellow-400 text-lg">
                {"★★★★★"}
              </div>

              {/* Feedback */}
              <p className="text-gray-300 mb-6">"{review.feedback}"</p>

              {/* User Info */}
              <div className="flex items-center gap-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-white">{review.name}</p>
                  <p className="text-sm text-gray-400">{review.role}</p>
                  <p className="text-xs text-purple-400 mt-1">{review.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
