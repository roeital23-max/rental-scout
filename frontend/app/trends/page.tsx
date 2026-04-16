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
      <p className="text-sm text-[#FF5252] mt-4">
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
          style={{ background: "#0D1421", borderRadius: "10px", border: "1px solid #1e2a3a" }}
        >
          <div className="text-xs text-[#8899AA] mb-1">Current median</div>
          <div
            className="text-xl font-bold text-[#e2e8f0]"
            style={{ fontFamily: "var(--font-space-mono), monospace" }}
          >
            ₪{latest.toLocaleString()}
          </div>
        </div>
        <div
          className="flex-1 px-4 py-3"
          style={{ background: "#0D1421", borderRadius: "10px", border: "1px solid #1e2a3a" }}
        >
          <div className="text-xs text-[#8899AA] mb-1">12-month change</div>
          <div
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-space-mono), monospace",
              color: up ? "#00E5A0" : "#FF5252",
            }}
          >
            {up ? "+" : ""}{changePct}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="p-4"
        style={{ background: "#0D1421", borderRadius: "12px", border: "1px solid #1e2a3a" }}
      >
        <div className="text-xs text-[#8899AA] mb-3">Median rent · ₪/month</div>
        <TrendChart data={data} neighborhood={nbLabel} />
      </div>

      <p className="text-xs text-[#8899AA] mt-3 text-center">
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
        className="inline-flex items-center text-sm text-[#8899AA] hover:text-[#e2e8f0] transition-colors mb-6 py-2 -my-2"
      >
        ← Back to results
      </Link>

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#e2e8f0]">{nbLabel}</h1>
        <p className="text-sm text-[#8899AA]">{cityLabel} · 12-month price trend</p>
      </div>

      {!city || !neighborhood ? (
        <p className="text-sm text-[#8899AA] mt-6">
          No neighborhood selected. Go back to search results and click a neighborhood.
        </p>
      ) : (
        <Suspense
          fallback={
            <div className="mt-6 text-sm text-[#8899AA] animate-pulse">
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
