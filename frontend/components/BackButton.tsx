"use client";

export default function BackButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-sm text-[#8899AA] hover:text-[#E8EDF5] transition-colors flex items-center gap-1"
    >
      {label}
    </button>
  );
}
