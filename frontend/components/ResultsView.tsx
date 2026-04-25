"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import ListingCard from "./ListingCard";
import type { Listing } from "@/lib/api";

const CITY_LABELS: Record<string, { he: string; en: string }> = {
  tel_aviv:      { he: "תל אביב",       en: "Tel Aviv" },
  jerusalem:     { he: "ירושלים",        en: "Jerusalem" },
  haifa:         { he: "חיפה",           en: "Haifa" },
  beer_sheva:    { he: "באר שבע",        en: "Beer Sheva" },
  rishon_lezion: { he: "ראשון לציון",    en: "Rishon LeZion" },
  petah_tikva:   { he: "פתח תקווה",     en: "Petah Tikva" },
  ashdod:        { he: "אשדוד",          en: "Ashdod" },
  netanya:       { he: "נתניה",          en: "Netanya" },
};

type SearchParams = {
  city?: string;
  rooms?: string;
  max_price?: string;
};

type Props = {
  listings: Listing[];
  searchParams: SearchParams;
};

export default function ResultsView({ listings, searchParams }: Props) {
  const { lang, t } = useLanguage();

  const cityEntry = searchParams.city ? CITY_LABELS[searchParams.city] : null;
  const cityLabel = cityEntry ? cityEntry[lang] : null;

  const headingLocation = cityLabel
    ? `${t.resultsIn}${cityLabel}`
    : t.resultsInAll;

  const maxPriceFormatted = searchParams.max_price
    ? t.filterMaxPrice.replace("{price}", Number(searchParams.max_price).toLocaleString())
    : null;

  const hasFilters = searchParams.city || searchParams.rooms || searchParams.max_price;

  return (
    <main className="min-h-screen px-4 py-6 md:py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-6 py-2 -my-2 transition-opacity hover:opacity-70"
          style={{ color: "#637280" }}
        >
          {t.backToSearch}
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#1A2730" }}>
          {listings.length > 0 ? (
            <>
              {t.resultsFound}{" "}
              <span style={{ color: "#1E7B7B" }}>
                {listings.length} {t.resultsSuffix}
              </span>{" "}
              {headingLocation}
            </>
          ) : (
            <>
              {t.resultsFound} {t.resultsSuffix} {headingLocation}
            </>
          )}
        </h1>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {cityLabel && (
              <FilterChip label={`${t.filterCity}: ${cityLabel}`} />
            )}
            {searchParams.rooms && (
              <FilterChip label={`${searchParams.rooms} ${t.filterRooms}`} />
            )}
            {maxPriceFormatted && <FilterChip label={maxPriceFormatted} />}
          </div>
        )}
      </div>

      {/* Grid or empty state */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 text-sm"
      style={{
        backgroundColor: "#E6F4F4",
        borderRadius: "99px",
        border: "1px solid #1E7B7B30",
        color: "#1E7B7B",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  const { t } = useLanguage();
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #DDE4E8",
        borderRadius: 16,
      }}
    >
      <div className="text-4xl mb-4 opacity-40">🔍</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: "#1A2730" }}>
        {t.emptyTitle}
      </h2>
      <p className="mb-6" style={{ color: "#637280" }}>{t.emptySub}</p>
      <Link
        href="/"
        className="px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "#1E7B7B",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        {t.newSearch}
      </Link>
    </div>
  );
}
