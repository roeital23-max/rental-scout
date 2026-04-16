"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { lang, t, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      aria-label={lang === "he" ? "Switch to English" : "עבור לעברית"}
      className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
      style={{
        backgroundColor: "#0D1421",
        border: "1px solid #2a3a4a",
        borderRadius: "99px",
        color: "#00E5A0",
      }}
    >
      {/* Current language (active, green) */}
      <span style={{ color: "#00E5A0" }}>{lang === "he" ? "עב" : "EN"}</span>
      <span style={{ color: "#8899AA", fontSize: "10px" }}>/</span>
      {/* Other language (muted) */}
      <span style={{ color: "#8899AA" }}>{t.toggleLang}</span>
    </button>
  );
}
