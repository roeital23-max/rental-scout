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
      style={{ backgroundColor: "#0D1421", borderColor: "#1e2a3a" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-medium transition-opacity hover:opacity-80 flex-shrink-0"
          style={{
            fontFamily: "var(--font-space-mono), monospace",
            color: "#00E5A0",
          }}
        >
          Rental Scout
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
                  color: isActive ? "#00E5A0" : "#8899AA",
                  backgroundColor: isActive ? "rgba(0, 229, 160, 0.08)" : "transparent",
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
