"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const CITIES_HE = [
  { value: "tel_aviv", label: "תל אביב" },
  { value: "jerusalem", label: "ירושלים" },
  { value: "haifa", label: "חיפה" },
  { value: "beer_sheva", label: "באר שבע" },
];

const CITIES_EN = [
  { value: "tel_aviv", label: "Tel Aviv" },
  { value: "jerusalem", label: "Jerusalem" },
  { value: "haifa", label: "Haifa" },
  { value: "beer_sheva", label: "Beer Sheva" },
];

const ROOMS = [
  { value: "1", labelHe: "1 חדר", labelEn: "1 room" },
  { value: "1.5", labelHe: "1.5 חדרים", labelEn: "1.5 rooms" },
  { value: "2", labelHe: "2 חדרים", labelEn: "2 rooms" },
  { value: "2.5", labelHe: "2.5 חדרים", labelEn: "2.5 rooms" },
  { value: "3", labelHe: "3 חדרים", labelEn: "3 rooms" },
  { value: "3.5", labelHe: "3.5 חדרים", labelEn: "3.5 rooms" },
  { value: "4", labelHe: "4 חדרים", labelEn: "4 rooms" },
  { value: "4.5", labelHe: "4.5+ חדרים", labelEn: "4.5+ rooms" },
];

export default function HomePage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [city, setCity] = useState("");
  const [rooms, setRooms] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const cities = lang === "he" ? CITIES_HE : CITIES_EN;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (rooms) params.set("rooms", rooms);
    if (maxPrice) params.set("max_price", maxPrice);
    router.push(`/results?${params.toString()}`);
  }

  const inputStyle = {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4E8",
    borderRadius: 8,
    borderWidth: 1,
    color: "#1A2730",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-16">
      {/* Hero */}
      <div className="text-center mb-8 md:mb-12 max-w-2xl">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-badge mb-6 uppercase tracking-widest"
          style={{
            color: "#1E7B7B",
            backgroundColor: "#E6F4F4",
            border: "1px solid #1E7B7B30",
            fontFamily: "var(--font-dm-mono), monospace",
          }}
        >
          {t.badge}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "#1A2730" }}>
          {t.heroTitle}
          <br />
          <span style={{ color: "#1E7B7B" }}>{t.heroHighlight}</span>
        </h1>

        <p className="text-lg leading-relaxed" style={{ color: "#637280" }}>
          {t.heroSub}
          <br />
          {t.heroData}
        </p>
      </div>

      {/* Search card */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl flex flex-col gap-4 p-6 md:p-8"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          border: "1px solid #DDE4E8",
          boxShadow: "0 4px 28px rgba(30,123,123,0.08)",
        }}
      >
        {/* City */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: "#637280" }}>
            {t.cityLabel}
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 border transition-colors focus:outline-none focus:border-[#1E7B7B]"
            style={inputStyle}
          >
            <option value="">{t.cityPlaceholder}</option>
            {cities.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rooms */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: "#637280" }}>
            {t.roomsLabel}
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className="w-full px-4 py-3 border transition-colors focus:outline-none focus:border-[#1E7B7B]"
            style={inputStyle}
          >
            <option value="">{t.roomsPlaceholder}</option>
            {ROOMS.map((r) => (
              <option key={r.value} value={r.value}>
                {lang === "he" ? r.labelHe : r.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Max price */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: "#637280" }}>
            {t.priceLabel}
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={t.pricePlaceholder}
            min={0}
            className="w-full px-4 py-3 border transition-colors focus:outline-none focus:border-[#1E7B7B]"
            style={inputStyle}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 mt-2 text-base font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            backgroundColor: "#1E7B7B",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(30,123,123,0.30)",
          }}
        >
          {t.searchBtn}
        </button>
      </form>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 md:mt-10 text-xs" style={{ color: "#637280" }}>
        <span>{t.trustListings}</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{t.trustUpdate}</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{t.trustData}</span>
      </div>

      {/* Feature cards */}
      <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <Link
          href="/benefits"
          className="flex flex-col gap-2 p-4 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #DDE4E8",
          }}
        >
          <span className="text-xl">🏛️</span>
          <span className="font-medium text-sm" style={{ color: "#1A2730" }}>{t.featBenefitsTitle}</span>
          <span className="text-xs leading-relaxed" style={{ color: "#637280" }}>{t.featBenefitsSub}</span>
        </Link>

        <Link
          href="/pricing"
          className="flex flex-col gap-2 p-4 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #DDE4E8",
          }}
        >
          <span className="text-xl">💳</span>
          <span className="font-medium text-sm" style={{ color: "#1A2730" }}>{t.featPricingTitle}</span>
          <span className="text-xs leading-relaxed" style={{ color: "#637280" }}>{t.featPricingSub}</span>
        </Link>
      </div>
    </main>
  );
}
