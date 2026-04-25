import { Suspense } from "react";
import Link from "next/link";
import TrendChart from "@/components/TrendChart";
import { getTrends } from "@/lib/trendsApi";

type SearchParams = { city?: string; neighborhood?: string };

const CITY_LABELS: Record<string, string> = {
  tel_aviv:      "Tel Aviv",
  jerusalem:     "Jerusalem",
  haifa:         "Haifa",
  beer_sheva:    "Beer Sheva",
  rishon_lezion: "Rishon LeZion",
  petah_tikva:   "Petah Tikva",
  ashdod:        "Ashdod",
  netanya:       "Netanya",
};

const NEIGHBORHOOD_EN: Record<string, string> = {
  "פלורנטין":   "Florentin",
  "רמת אביב":  "Ramat Aviv",
  "נווה צדק":  "Neve Tzedek",
  "נחלאות":    "Nachlaot",
  "בקעה":      "Baka",
  "רחביה":     "Rehavia",
  "כרמל":      "Carmel",
  "נווה שאנן": "Neve Sha'anan",
  "נאות לון":  "Naot Lon",
};

async function TrendsContent({
  city,
  neighborhood,
}: {
  city: string;
  neighborhood: string;
}) {
  let data;
  try {
    data = await getTrends(city, neighborhood);
  } catch {
    return (
      <p className="text-sm mt-4" style={{ color: "#BC2B2B" }}>
        Could not load trend data — check that the API is running.
      </p>
    );
  }

  const cityLabel = CITY_LABELS[city] ?? city;
  const nbLabel = NEIGHBORHOOD_EN[neighborhood] ?? neighborhood;
  const prices = data.map((d) => d.median_price);
  const latest = prices.at(-1) ?? 0;
  const earliest = prices[0] ?? 0;
  const changePct = earliest ? (((latest - earliest) / earliest) * 100).toFixed(1) : "0.0";
  const up = latest >= earliest;

  return (
    <>
      {/* Stats row */}
      <div className="flex gap-4 mt-4 mb-6">
        <div
          className="flex-1 px-4 py-3"
          style={{ background: "#FFFFFF", borderRadius: "10px", border: "1px solid #DDE4E8", boxShadow: "0 2px 8px rgba(30,123,123,0.06)" }}
        >
          <div className="text-xs mb-1" style={{ color: "#637280" }}>Current median</div>
          <div
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-dm-mono), monospace", color: "#1A2730" }}
          >
            ₪{latest.toLocaleString()}
          </div>
        </div>
        <div
          className="flex-1 px-4 py-3"
          style={{ background: "#FFFFFF", borderRadius: "10px", border: "1px solid #DDE4E8", boxShadow: "0 2px 8px rgba(30,123,123,0.06)" }}
        >
          <div className="text-xs mb-1" style={{ color: "#637280" }}>12-month change</div>
          <div
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-dm-mono), monospace",
              color: up ? "#2E7D52" : "#BC2B2B",
            }}
          >
            {up ? "+" : ""}{changePct}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="p-4"
        style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE4E8", boxShadow: "0 2px 12px rgba(30,123,123,0.06)" }}
      >
        <div className="text-xs mb-3" style={{ color: "#637280" }}>Median rent · ₪/month</div>
        <TrendChart data={data} neighborhood={nbLabel} />
      </div>

      <p className="text-xs mt-3 text-center" style={{ color: "#637280" }}>
        Synthetic trend based on current listing data · updates when new listings are scraped
      </p>
    </>
  );
}

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const city = params.city ?? "";
  const neighborhood = params.neighborhood ?? "";

  const cityLabel = CITY_LABELS[city] ?? city;
  const nbLabel = NEIGHBORHOOD_EN[neighborhood] ?? neighborhood;

  return (
    <main className="min-h-screen px-4 py-8 max-w-xl mx-auto">
      {/* Back link */}
      <Link
        href="/results"
        className="inline-flex items-center text-sm transition-opacity hover:opacity-70 mb-6 py-2 -my-2"
        style={{ color: "#637280" }}
      >
        ← Back to results
      </Link>

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "#1A2730" }}>{nbLabel}</h1>
        <p className="text-sm" style={{ color: "#637280" }}>{cityLabel} · 12-month price trend</p>
      </div>

      {!city || !neighborhood ? (
        <p className="text-sm mt-6" style={{ color: "#637280" }}>
          No neighborhood selected. Go back to search results and click a neighborhood.
        </p>
      ) : (
        <Suspense
          fallback={
            <div className="mt-6 text-sm animate-pulse" style={{ color: "#637280" }}>
              Loading trend data…
            </div>
          }
        >
          <TrendsContent city={city} neighborhood={neighborhood} />
        </Suspense>
      )}
    </main>
  );
}
