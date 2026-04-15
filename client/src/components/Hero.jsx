// src/components/Hero.jsx

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/bgc-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-4 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Build AI-Powered Interviews
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-200">
          Practice, prepare, and excel with interactive AI-driven mock interviews.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition shadow-lg">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-500 transition shadow-lg">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
