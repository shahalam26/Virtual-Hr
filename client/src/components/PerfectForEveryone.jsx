import { Briefcase, GraduationCap, Bot, MessageSquare, FileQuestion, Activity } from "lucide-react";

export default function PerfectForEveryone() {
  return (
    <section className="py-20 bg-[#0B0F19] text-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* ---------------- For Recruiters ---------------- */}
        <div>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6 w-fit px-4 py-2 rounded-full bg-[#1C1F2E] border border-gray-700">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">For Recruiters</span>
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Streamline Your Hiring Process
          </h2>
          <p className="text-gray-400 mb-8">
            Save time and resources while ensuring you find the best candidates for your organization
          </p>

          {/* Feature Cards */}
          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-xl border border-gray-700 bg-[#111827] flex gap-4 items-start hover:scale-[1.02] transition">
              <Bot className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold">Advanced AI Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Our AI evaluates candidates on communication, technical knowledge, and soft skills
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-700 bg-[#111827] flex gap-4 items-start hover:scale-[1.02] transition">
              <MessageSquare className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold">Real-time Feedback</h3>
                <p className="text-gray-400 text-sm">
                  Get instant insights on candidate performance and areas for improvement
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-700 bg-[#111827] flex gap-4 items-start hover:scale-[1.02] transition">
              <FileQuestion className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold">Customizable Questions</h3>
                <p className="text-gray-400 text-sm">
                  Tailor interview questions based on job requirements and company culture
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition">
            Start Recruiting
          </button>
        </div>

        {/* ---------------- For Students ---------------- */}
        <div>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6 w-fit px-4 py-2 rounded-full bg-[#1C1F2E] border border-gray-700">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium">For Students</span>
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Master Your Interview Skills
          </h2>
          <p className="text-gray-400 mb-8">
            Practice with confidence and get the feedback you need to land your dream job
          </p>

          {/* Feature Cards */}
          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-xl border border-gray-700 bg-[#111827] flex gap-4 items-start hover:scale-[1.02] transition">
              <MessageSquare className="w-6 h-6 text-cyan-400 mt-1" />
              <div>
                <h3 className="font-semibold">Multiple Interview Modes</h3>
                <p className="text-gray-400 text-sm">
                  Practice with Chat, Voice, or Avatar interfaces to match your comfort level
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-700 bg-[#111827] flex gap-4 items-start hover:scale-[1.02] transition">
              <Bot className="w-6 h-6 text-cyan-400 mt-1" />
              <div>
                <h3 className="font-semibold">Personalized Practice</h3>
                <p className="text-gray-400 text-sm">
                  AI generates questions based on your resume and target job roles
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-700 bg-[#111827] flex gap-4 items-start hover:scale-[1.02] transition">
              <Activity className="w-6 h-6 text-cyan-400 mt-1" />
              <div>
                <h3 className="font-semibold">Detailed Performance Reports</h3>
                <p className="text-gray-400 text-sm">
                  Get comprehensive feedback on your answers, body language, and communication
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition">
            Start Practicing
          </button>
        </div>

      </div>
    </section>
  );
}
