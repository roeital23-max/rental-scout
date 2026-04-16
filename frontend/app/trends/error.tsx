"use client";

export default function TrendsError({ reset }: { reset: () => void }) {
  return (
    <div className="mt-6 px-4 py-3 rounded-lg" style={{ background: "#0D1421", border: "1px solid #1e2a3a" }}>
      <p className="text-sm text-[#FF5252] mb-3">Could not load trend data — API unreachable.</p>
      <button
        onClick={reset}
        className="text-xs px-3 py-1.5 rounded-md transition-colors"
        style={{ background: "#1e2a3a", color: "#8899AA" }}
      >
        Retry
      </button>
    </div>
  );
}
