export default function CareerCTA() {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-[#141E30] to-[#243B55] text-center rounded-3xl max-w-6xl mx-auto mt-16 shadow-lg">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
        Ready to Transform Your Career?
      </h2>
      <p className="text-gray-300 max-w-2xl mx-auto mb-8">
        Join thousands of professionals who have already improved their interview skills with our AI technology
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Primary CTA */}
        <button className="px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-90 transition shadow-md">
          Get Started Free
        </button>

        {/* Secondary CTA */}
        <button className="px-8 py-4 rounded-full font-semibold text-white border border-gray-400 hover:bg-white/10 transition">
          Schedule Demo
        </button>
      </div>
    </section>
  );
}
