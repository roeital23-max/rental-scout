import Link from "next/link";
import { notFound } from "next/navigation";
import DealBadge from "@/components/DealBadge";
import TrendChart from "@/components/TrendChart";
import BackButton from "@/components/BackButton";
import { getListing } from "@/lib/api";
import { getTrends } from "@/lib/trendsApi";
import { strings } from "@/lib/i18n";

const CITY_LABELS: Record<string, string> = {
  tel_aviv:      "תל אביב",
  jerusalem:     "ירושלים",
  haifa:         "חיפה",
  beer_sheva:    "באר שבע",
  rishon_lezion: "ראשון לציון",
  petah_tikva:   "פתח תקווה",
  ashdod:        "אשדוד",
  netanya:       "נתניה",
};

const FEATURE_KEYS: Record<string, keyof typeof strings.he> = {
  balcony:          "featureBalcony",
  parking:          "featureParking",
  garden:           "featureGarden",
  mamad:            "featureMamad",
  building_shelter: "featureBuildingShelter",
  public_shelter:   "featurePublicShelter",
};

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing;
  try {
    listing = await getListing(id);
  } catch {
    notFound();
  }

  const trends = await getTrends(listing.city, listing.neighborhood).catch(() => []);

  const he = strings.he;
  const cityLabel = CITY_LABELS[listing.city] ?? listing.city;
  const isSpecialType = listing.listing_type === "roommate" || listing.listing_type === "parking";

  // Price-per-sqm analysis
  const hasSqm = listing.sqm > 5;
  const ppsqm = hasSqm ? Math.round(listing.price_nis / listing.sqm) : null;
  const medianPpsqm =
    hasSqm && listing.deal_score !== 0
      ? Math.round(ppsqm! / (1 + listing.deal_score / 100))
      : null;

  const floorLabel =
    listing.floor === 0
      ? he.groundFloor
      : `${he.floor} ${listing.floor}`;

  return (
    <main className="min-h-screen py-8 px-4 max-w-2xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <BackButton label={he.backToResults} />
      </div>

      {/* Header row: neighborhood + city + badge */}
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "#1A2730", direction: "rtl" }}
          >
            {listing.neighborhood}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#637280" }}>{cityLabel}</p>
        </div>
        <DealBadge label={listing.deal_label} score={listing.deal_score} />
      </div>

      {/* Price */}
      <p
        className="text-4xl font-bold mt-4 mb-6"
        style={{
          fontFamily: "var(--font-dm-mono), monospace",
          color: "#1A2730",
        }}
      >
        ₪{listing.price_nis.toLocaleString()}
        <span className="text-lg font-normal ms-1" style={{ color: "#637280" }}>
          {he.perMonth}
        </span>
      </p>

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap mb-6">
        {(
          [
            `${String(listing.rooms).replace(".0", "")} ${he.rooms}`,
            `${listing.sqm} ${he.sqm}`,
            floorLabel,
          ] as string[]
        ).map((stat) => (
          <div
            key={stat}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#E6F4F4", border: "1px solid #DDE4E8", color: "#1A2730" }}
          >
            {stat}
          </div>
        ))}
      </div>

      {/* Features */}
      {listing.features.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {listing.features.map((f) => {
            const key = FEATURE_KEYS[f];
            const label = key ? he[key] : f;
            return (
              <span
                key={f}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#E6F4F4", border: "1px solid #DDE4E8", color: "#1E7B7B" }}
              >
                {label as string}
              </span>
            );
          })}
        </div>
      )}

      {/* Special-type notice (roommate / parking) */}
      {isSpecialType && (
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{ background: "#F0F3F5", border: "1px solid #DDE4E8", color: "#637280" }}
        >
          {listing.listing_type === "roommate" ? he.roommateNotice : he.parkingNotice}
        </div>
      )}

      {/* Price analysis (apartments only) */}
      {!isSpecialType && (
        <div
          className="rounded-xl p-5 mb-6"
          style={{ background: "#FFFFFF", border: "1px solid #DDE4E8", boxShadow: "0 2px 12px rgba(30,123,123,0.06)" }}
        >
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#637280", fontFamily: "var(--font-dm-mono), monospace" }}
          >
            {he.priceAnalysis}
          </h2>

          {/* Deviation */}
          <p className="text-base mb-2" style={{ color: "#1A2730" }}>
            <span
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontWeight: 700,
                color:
                  listing.deal_score < -10
                    ? "#2E7D52"
                    : listing.deal_score > 10
                    ? "#BC2B2B"
                    : "#B5620E",
              }}
            >
              {listing.deal_score === 0
                ? "±0%"
                : listing.deal_score < 0
                ? `${listing.deal_score}%`
                : `+${listing.deal_score}%`}
            </span>{" "}
            {listing.deal_score < 0
              ? `מתחת ל${he.medianLabel}`
              : listing.deal_score > 0
              ? `מעל ${he.medianLabel}`
              : he.medianLabel}
          </p>

          {/* Price-per-sqm rows */}
          {ppsqm && medianPpsqm && (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between text-sm">
                <span style={{ color: "#637280" }}>מחיר למ"ר</span>
                <span style={{ fontFamily: "var(--font-dm-mono), monospace", color: "#1A2730", fontWeight: 600 }}>
                  ₪{ppsqm.toLocaleString()}/מ"ר
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#637280" }}>חציון בשכונה</span>
                <span style={{ fontFamily: "var(--font-dm-mono), monospace", color: "#637280" }}>
                  ₪{medianPpsqm.toLocaleString()}/מ"ר
                </span>
              </div>
            </div>
          )}

          {/* Listed date */}
          <p className="text-xs mt-3" style={{ color: "#637280" }}>
            {he.listedOn}: {listing.listed_at}
          </p>
        </div>
      )}

      {/* Yad2 CTA */}
      <a
        href={listing.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold mb-8 transition-opacity hover:opacity-80"
        style={{
          background: "#E6F4F4",
          border: "1px solid #1E7B7B30",
          color: "#1E7B7B",
        }}
      >
        {he.viewOnYad2} ↗
      </a>

      {/* Trends section */}
      {trends.length > 0 && (
        <section>
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: "#1A2730", borderTop: "1px solid #DDE4E8", paddingTop: "1.5rem" }}
          >
            {he.neighborhoodTrends}
          </h2>
          <TrendChart data={trends} neighborhood={listing.neighborhood} />
        </section>
      )}
    </main>
  );
}
