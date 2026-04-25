"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";

export default function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navLinks = [
    { href: "/", label: t.navHome },
    { href: "/benefits", label: t.navBenefits },
    { href: "/pricing", label: t.navPricing },
  ];

  return (
    <header
      className="sticky top-0 z-40 h-14 border-b"
      style={{ backgroundColor: "#1A2730", borderColor: "#243340" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-4" dir="ltr">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity" style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
          Shakuf
        </Link>

        {/* Nav links — hidden on mobile, visible md+ */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm rounded-md transition-colors"
                style={{
                  color: isActive ? "#6BB8B8" : "rgba(255,255,255,0.5)",
                  backgroundColor: isActive ? "rgba(30,123,123,0.15)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Language toggle */}
        <LanguageToggle />
      </div>
    </header>
  );
}
