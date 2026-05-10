"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TrendChart from "@/components/TrendChart";
import { getTrends, type TrendPoint } from "@/lib/trendsApi";
import { useLanguage } from "@/components/LanguageProvider";

const CITY_LABELS: Record<string, { he: string; en: string }> = {
  tel_aviv:      { he: "תל אביב",      en: "Tel Aviv" },
  jerusalem:     { he: "ירושלים",      en: "Jerusalem" },
  haifa:         { he: "חיפה",         en: "Haifa" },
  beer_sheva:    { he: "באר שבע",      en: "Beer Sheva" },
  rishon_lezion: { he: "ראשון לציון",  en: "Rishon LeZion" },
  petah_tikva:   { he: "פתח תקווה",   en: "Petah Tikva" },
  ashdod:        { he: "אשדוד",        en: "Ashdod" },
  netanya:       { he: "נתניה",        en: "Netanya" },
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

function TrendsContent({ city, neighborhood }: { city: string; neighborhood: string }) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<TrendPoint[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setData(null);
    setError(false);
    getTrends(city, neighborhood)
      .then(setData)
      .catch(() => setError(true));
  }, [city, neighborhood]);

  const cityEntry = CITY_LABELS[city];
  const cityLabel = cityEntry ? (lang === "he" ? cityEntry.he : cityEntry.en) : city;
  const nbLabel = lang === "he" ? neighborhood : (NEIGHBORHOOD_EN[neighborhood] ?? neighborhood);

  return (
    <>
      <div className="mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "#1A2730" }}>{nbLabel}</h1>
        <p className="text-sm" style={{ color: "#637280" }}>{cityLabel} · {t.trendsPriceTrend}</p>
      </div>

      {error ? (
        <p className="text-sm mt-4" style={{ color: "#BC2B2B" }}>{t.trendsError}</p>
      ) : !data ? (
        <div className="mt-6 text-sm animate-pulse" style={{ color: "#637280" }}>{t.trendsLoading}</div>
      ) : (
        <>
          <div className="flex gap-4 mt-4 mb-6">
            <div
              className="flex-1 px-4 py-3"
              style={{ background: "#FFFFFF", borderRadius: "10px", border: "1px solid #DDE4E8", boxShadow: "0 2px 8px rgba(30,123,123,0.06)" }}
            >
              <div className="text-xs mb-1" style={{ color: "#637280" }}>{t.trendsCurrentMedian}</div>
              <div className="text-xl font-bold" style={{ fontFamily: "var(--font-dm-mono), monospace", color: "#1A2730" }}>
                ₪{(data.at(-1)?.median_price ?? 0).toLocaleString()}
              </div>
            </div>
            <div
              className="flex-1 px-4 py-3"
              style={{ background: "#FFFFFF", borderRadius: "10px", border: "1px solid #DDE4E8", boxShadow: "0 2px 8px rgba(30,123,123,0.06)" }}
            >
              <div className="text-xs mb-1" style={{ color: "#637280" }}>{t.trends12mo}</div>
              <div
                className="text-xl font-bold"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: (data.at(-1)?.median_price ?? 0) >= (data[0]?.median_price ?? 0) ? "#2E7D52" : "#BC2B2B",
                }}
              >
                {(() => {
                  const latest = data.at(-1)?.median_price ?? 0;
                  const earliest = data[0]?.median_price ?? 0;
                  const pct = earliest ? (((latest - earliest) / earliest) * 100).toFixed(1) : "0.0";
                  return `${latest >= earliest ? "+" : ""}${pct}%`;
                })()}
              </div>
            </div>
          </div>

          <div
            className="p-4"
            style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE4E8", boxShadow: "0 2px 12px rgba(30,123,123,0.06)" }}
          >
            <div className="text-xs mb-3" style={{ color: "#637280" }}>{t.trendsMedianRent}</div>
            <TrendChart data={data} neighborhood={nbLabel} />
          </div>

          <p className="text-xs mt-3 text-center" style={{ color: "#637280" }}>
            {t.trendsNote}
          </p>
        </>
      )}
    </>
  );
}

function TrendsInner() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const city = searchParams.get("city") ?? "";
  const neighborhood = searchParams.get("neighborhood") ?? "";

  return (
    <main className="min-h-screen px-4 py-8 max-w-xl mx-auto">
      <Link
        href="/results"
        className="inline-flex items-center text-sm transition-opacity hover:opacity-70 mb-6 py-2 -my-2"
        style={{ color: "#637280" }}
      >
        {t.trendsBack}
      </Link>

      {!city || !neighborhood ? (
        <p className="text-sm mt-6" style={{ color: "#637280" }}>{t.trendsNoNeighborhood}</p>
      ) : (
        <TrendsContent city={city} neighborhood={neighborhood} />
      )}
    </main>
  );
}

export default function TrendsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <TrendsInner />
    </Suspense>
  );
}
