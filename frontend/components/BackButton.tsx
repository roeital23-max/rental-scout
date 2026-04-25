"use client";

export default function BackButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-sm transition-opacity hover:opacity-70 flex items-center gap-1"
      style={{ color: "#637280" }}
    >
      {label}
    </button>
  );
}
