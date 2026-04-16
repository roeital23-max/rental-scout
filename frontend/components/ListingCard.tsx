"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import DealBadge from "./DealBadge";
import type { Listing, Feature } from "@/lib/mockData";

type Props = {
  listing: Listing;
};

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

const NEIGHBORHOOD_LABELS: Record<string, { he: string; en: string }> = {
  "פלורנטין":   { he: "פלורנטין",   en: "Florentin" },
  "רמת אביב":  { he: "רמת אביב",  en: "Ramat Aviv" },
  "נווה צדק":  { he: "נווה צדק",  en: "Neve Tzedek" },
  "נחלאות":    { he: "נחלאות",    en: "Nachlaot" },
  "בקעה":      { he: "בקעה",      en: "Baka" },
  "רחביה":     { he: "רחביה",     en: "Rehavia" },
  "כרמל":      { he: "כרמל",      en: "Carmel" },
  "נווה שאנן": { he: "נווה שאנן", en: "Neve Sha'anan" },
  "נאות לון":  { he: "נאות לון",  en: "Naot Lon" },
};

const FEATURE_KEY: Record<Feature, "featureBalcony" | "featureParking" | "featureGarden" | "featureMamad" | "featureBuildingShelter" | "featurePublicShelter"> = {
  balcony:          "featureBalcony",
  parking:          "featureParking",
  garden:           "featureGarden",
  mamad:            "featureMamad",
  building_shelter: "featureBuildingShelter",
  public_shelter:   "featurePublicShelter",
};

function formatDate(iso: string, lang: "he" | "en"): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "he" ? "he-IL" : "en-IL", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export default function ListingCard({ listing }: Props) {
  const { lang, t } = useLanguage();

  const cityEntry = CITY_LABELS[listing.city];
  const cityLabel = cityEntry ? cityEntry[lang] : listing.city;

  const nbEntry = NEIGHBORHOOD_LABELS[listing.neighborhood];
  const nbLabel = nbEntry ? nbEntry[lang] : listing.neighborhood;

  const floorLabel =
    listing.floor === 0
      ? t.groundFloor
      : `${t.floor} ${listing.floor}`;

  const features = listing.features ?? [];
  const visibleFeatures = features.slice(0, 2);
  const extraCount = features.length - visibleFeatures.length;

  const chipStyle = {
    backgroundColor: "#1e2a3a",
    borderRadius: "99px",
    border: "1px solid #2a3a4a",
  };

  return (
    <div
      className="flex flex-col gap-4 p-5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
      style={{
        backgroundColor: "#0D1421",
        borderRadius: "12px",
        border: "1px solid #1e2a3a",
      }}
    >
      {/* Top row: location + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
              href={`/trends?city=${listing.city}&neighborhood=${encodeURIComponent(listing.neighborhood)}`}
              className="font-medium text-txt-primary truncate hover:text-[#00E5A0] transition-colors"
            >
              {nbLabel}
            </Link>
          <span className="text-sm text-txt-secondary">{cityLabel}</span>
        </div>
        <div className="flex-shrink-0">
          <DealBadge label={listing.deal_label} score={listing.deal_score} />
        </div>
      </div>

      {/* Price */}
      <div
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-space-mono), monospace" }}
      >
        ₪{listing.price_nis.toLocaleString()}
        <span className="text-base font-normal text-txt-secondary mr-1">
          {t.perMonth}
        </span>
      </div>

      {/* Details row */}
      <div className="flex items-center gap-4 text-sm text-txt-secondary">
        <span>
          <span className="text-txt-primary font-medium">{listing.rooms}</span>{" "}
          {t.rooms}
        </span>
        <span className="text-xs opacity-30">·</span>
        <span>
          <span className="text-txt-primary font-medium">{listing.sqm}</span>{" "}
          {t.sqm}
        </span>
        <span className="text-xs opacity-30">·</span>
        <span>{floorLabel}</span>
      </div>

      {/* Feature chips */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleFeatures.map((f) => (
            <span
              key={f}
              className="inline-flex items-center px-2.5 py-1 text-xs text-txt-secondary"
              style={chipStyle}
            >
              {t[FEATURE_KEY[f]]}
            </span>
          ))}
          {extraCount > 0 && (
            <span
              className="inline-flex items-center px-2.5 py-1 text-xs text-txt-secondary"
              style={chipStyle}
            >
              +{extraCount}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1e2a3a] mt-auto">
        <span className="text-xs text-txt-secondary">
          {formatDate(listing.listed_at, lang)}
        </span>
        <Link
          href={`/listing/${listing.id}`}
          className="text-sm font-medium hover:opacity-80 transition-opacity py-2 -my-2 px-1 -mx-1"
          style={{ color: "#00E5A0" }}
        >
          {t.moreDetails}
        </Link>
      </div>
    </div>
  );
}
