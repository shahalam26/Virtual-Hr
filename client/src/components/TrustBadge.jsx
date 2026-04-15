// src/components/TrustedBadge.jsx
export default function TrustedBadge() {
  return (
    <section className="py-12 bg-black text-center">
      <div className="max-w-3xl mx-auto px-6">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full border border-gray-700 bg-gray-900/50 text-white text-sm font-medium shadow-md">
          <span className="text-green-400 text-lg">🛡️</span>
          Trusted by leading tech companies worldwide
        </div>
      </div>
    </section>
  );
}
