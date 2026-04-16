"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type Lang, strings, type Strings } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  t: Strings;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("he");

  // On mount: read saved preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "en" || saved === "he") setLang(saved);
    } catch {
      // localStorage unavailable (private mode, storage blocked)
    }
  }, []);

  // Sync html dir + lang attribute whenever language changes
  useEffect(() => {
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  function toggle() {
    const next: Lang = lang === "he" ? "en" : "he";
    try {
      localStorage.setItem("lang", next);
    } catch {
      // localStorage unavailable
    }
    setLang(next);
  }

  return (
    <LanguageContext.Provider value={{ lang, t: strings[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
