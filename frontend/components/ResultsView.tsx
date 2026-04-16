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
          style={{ color: "#8899AA" }}
        >
          {t.backToSearch}
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-txt-primary mb-2">
          {listings.length > 0 ? (
            <>
              {t.resultsFound}{" "}
              <span style={{ color: "#00E5A0" }}>
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
      className="inline-flex items-center px-3 py-1 text-sm text-txt-secondary"
      style={{
        backgroundColor: "#1e2a3a",
        borderRadius: "99px",
        border: "1px solid #2a3a4a",
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
        backgroundColor: "#0D1421",
        border: "1px solid #1e2a3a",
        borderRadius: "12px",
      }}
    >
      <div className="text-4xl mb-4 opacity-40">🔍</div>
      <h2 className="text-xl font-semibold text-txt-primary mb-2">
        {t.emptyTitle}
      </h2>
      <p className="text-txt-secondary mb-6">{t.emptySub}</p>
      <Link
        href="/"
        className="px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "#00E5A0",
          color: "#0A0E1A",
          borderRadius: "8px",
        }}
      >
        {t.newSearch}
      </Link>
    </div>
  );
}
