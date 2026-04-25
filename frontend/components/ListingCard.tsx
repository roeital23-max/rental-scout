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

  // Comparison bar — only for scored listings
  const hasScore = listing.deal_label !== "roommate" && listing.deal_label !== "parking" && listing.deal_score !== 0;
  const median = hasScore ? Math.round(listing.price_nis / (1 + listing.deal_score / 100)) : 0;
  const saving = median - listing.price_nis;
  const barPct = median > 0 ? Math.min((listing.price_nis / median) * 100, 100) : 0;
  const isGoodDeal = listing.deal_label === "great_deal";

  return (
    <div
      className="flex flex-col transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid #DDE4E8",
        boxShadow: "0 4px 28px rgba(30,123,123,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #1E7B7B, #6BB8B8)" }} />

      <div className="flex flex-col gap-3 p-5">
        {/* Location + badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <Link
              href={`/trends?city=${listing.city}&neighborhood=${encodeURIComponent(listing.neighborhood)}`}
              className="font-semibold truncate transition-colors"
              style={{ color: "#1A2730", fontSize: 15 }}
            >
              {nbLabel}
            </Link>
            <span style={{ fontSize: 11, color: "#637280" }}>{cityLabel}</span>
          </div>
          <div className="flex-shrink-0">
            <DealBadge label={listing.deal_label} score={listing.deal_score} />
          </div>
        </div>

        {/* Price */}
        <div>
          <div style={{ fontSize: 9, color: "#637280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2, fontFamily: "var(--font-dm-mono), monospace" }}>
            {t.perMonth}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#1A2730", letterSpacing: -1, fontFamily: "var(--font-dm-mono), monospace", lineHeight: 1 }}>
            ₪{listing.price_nis.toLocaleString()}
          </div>
        </div>

        {/* Details row */}
        <div className="flex items-center gap-3 text-sm" style={{ color: "#637280" }}>
          <span>
            <span style={{ color: "#1A2730", fontWeight: 600 }}>{listing.rooms}</span>{" "}
            {t.rooms}
          </span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span>
            <span style={{ color: "#1A2730", fontWeight: 600 }}>{listing.sqm}</span>{" "}
            {t.sqm}
          </span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span>{floorLabel}</span>
        </div>

        {/* Comparison bar */}
        {hasScore && median > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: "#637280", fontFamily: "var(--font-dm-mono), monospace" }}>
                ₪{listing.price_nis.toLocaleString()}
              </span>
              <span style={{ fontSize: 10, color: "#637280", fontFamily: "var(--font-dm-mono), monospace" }}>
                {lang === "he" ? "חציון" : "median"} ₪{median.toLocaleString()}
              </span>
            </div>
            <div style={{ position: "relative", height: 7, background: "#E6F4F4", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                width: `${barPct}%`,
                background: isGoodDeal
                  ? "linear-gradient(90deg, #2E7D52, #6BB8B8)"
                  : "linear-gradient(90deg, #BC2B2B, #E88)",
                borderRadius: 99,
              }} />
            </div>
            {isGoodDeal && saving > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 11, color: "#2E7D52", fontWeight: 700, fontFamily: "var(--font-dm-mono), monospace" }}>
                  ↓ {lang === "he" ? "חיסכון" : "saving"} ₪{saving.toLocaleString()}/{lang === "he" ? "חודש" : "mo"}
                </span>
                <span style={{ fontSize: 11, color: "#2E7D52", fontWeight: 700, fontFamily: "var(--font-dm-mono), monospace" }}>
                  ₪{(saving * 12).toLocaleString()}/{lang === "he" ? "שנה" : "yr"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Feature chips */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleFeatures.map((f) => (
              <span
                key={f}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium"
                style={{ background: "#E6F4F4", borderRadius: 7, color: "#1E7B7B" }}
              >
                {t[FEATURE_KEY[f]]}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium"
                style={{ background: "#E6F4F4", borderRadius: 7, color: "#1E7B7B" }}
              >
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/listing/${listing.id}`}
          className="block text-center text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "#1E7B7B",
            color: "#fff",
            borderRadius: 12,
            padding: "11px 0",
            boxShadow: "0 4px 14px rgba(30,123,123,0.28)",
            marginTop: 2,
          }}
        >
          {t.moreDetails}
        </Link>
      </div>
    </div>
  );
}
