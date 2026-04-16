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
  { value: "rishon_lezion", label: "ראשון לציון" },
  { value: "petah_tikva", label: "פתח תקווה" },
  { value: "ashdod", label: "אשדוד" },
  { value: "netanya", label: "נתניה" },
];

const CITIES_EN = [
  { value: "tel_aviv", label: "Tel Aviv" },
  { value: "jerusalem", label: "Jerusalem" },
  { value: "haifa", label: "Haifa" },
  { value: "beer_sheva", label: "Beer Sheva" },
  { value: "rishon_lezion", label: "Rishon LeZion" },
  { value: "petah_tikva", label: "Petah Tikva" },
  { value: "ashdod", label: "Ashdod" },
  { value: "netanya", label: "Netanya" },
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
    backgroundColor: "#0A0E1A",
    borderColor: "#1e2a3a",
    borderRadius: "8px",
    borderWidth: "1px",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-16">
      {/* Hero */}
      <div className="text-center mb-8 md:mb-12 max-w-2xl">
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-badge mb-6 uppercase tracking-widest"
          style={{
            color: "#00E5A0",
            backgroundColor: "rgba(0, 229, 160, 0.1)",
            border: "1px solid rgba(0, 229, 160, 0.2)",
          }}
        >
          {t.badge}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-txt-primary leading-tight mb-4">
          {t.heroTitle}
          <br />
          <span style={{ color: "#00E5A0" }}>{t.heroHighlight}</span>
        </h1>

        <p className="text-lg text-txt-secondary leading-relaxed">
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
          backgroundColor: "#0D1421",
          borderRadius: "12px",
          border: "1px solid #1e2a3a",
        }}
      >
        {/* City */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-txt-secondary">
            {t.cityLabel}
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 text-txt-primary border transition-colors focus:outline-none"
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
          <label className="text-sm font-medium text-txt-secondary">
            {t.roomsLabel}
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className="w-full px-4 py-3 text-txt-primary border transition-colors focus:outline-none"
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
          <label className="text-sm font-medium text-txt-secondary">
            {t.priceLabel}
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={t.pricePlaceholder}
            min={0}
            className="w-full px-4 py-3 text-txt-primary border transition-colors focus:outline-none"
            style={inputStyle}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 mt-2 text-base font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            backgroundColor: "#00E5A0",
            color: "#0A0E1A",
            borderRadius: "8px",
          }}
        >
          {t.searchBtn}
        </button>
      </form>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 md:mt-10 text-xs text-txt-secondary">
        <span>{t.trustListings}</span>
        <span className="opacity-30">·</span>
        <span>{t.trustUpdate}</span>
        <span className="opacity-30">·</span>
        <span>{t.trustData}</span>
      </div>

      {/* Feature cards */}
      <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <Link
          href="/benefits"
          className="flex flex-col gap-2 p-4 transition-all duration-200 hover:border-[#2a3a4a] hover:translate-y-[-2px]"
          style={{
            backgroundColor: "#0D1421",
            borderRadius: "12px",
            border: "1px solid #1e2a3a",
          }}
        >
          <span className="text-xl">🏛️</span>
          <span className="font-medium text-txt-primary text-sm">{t.featBenefitsTitle}</span>
          <span className="text-xs text-txt-secondary leading-relaxed">{t.featBenefitsSub}</span>
        </Link>

        <Link
          href="/pricing"
          className="flex flex-col gap-2 p-4 transition-all duration-200 hover:border-[#2a3a4a] hover:translate-y-[-2px]"
          style={{
            backgroundColor: "#0D1421",
            borderRadius: "12px",
            border: "1px solid #1e2a3a",
          }}
        >
          <span className="text-xl">💳</span>
          <span className="font-medium text-txt-primary text-sm">{t.featPricingTitle}</span>
          <span className="text-xs text-txt-secondary leading-relaxed">{t.featPricingSub}</span>
        </Link>
      </div>
    </main>
  );
}
