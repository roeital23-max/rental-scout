"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useLanguage } from "./LanguageProvider";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  if (status === "loading") return null;

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="text-sm px-3 py-1.5 rounded-md transition-colors"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {t.signOut}
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="text-sm px-3 py-1.5 rounded-md font-medium transition-all hover:opacity-90"
      style={{ backgroundColor: "#1E7B7B", color: "#fff", borderRadius: 8 }}
    >
      {t.signIn}
    </button>
  );
}
