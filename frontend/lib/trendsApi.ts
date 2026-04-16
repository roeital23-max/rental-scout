export type TrendPoint = {
  month: string;
  median_price: number;
};

const IS_DEV =
  process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL;

function mockTrends(anchor: number): TrendPoint[] {
  const months = [
    "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar", "Apr",
  ];
  return months.map((month, i) => ({
    month,
    median_price: Math.round((anchor * (1 + 0.015 * (i / 11)) + anchor * 0.03 * Math.sin(i)) / 100) * 100,
  }));
}

export async function getTrends(
  city: string,
  neighborhood: string
): Promise<TrendPoint[]> {
  if (IS_DEV) {
    return mockTrends(5500);
  }

  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const encoded = encodeURIComponent(neighborhood);
  const res = await fetch(`${base}/api/trends/${city}/${encoded}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`Trends API error: ${res.status}`);
  return res.json();
}
