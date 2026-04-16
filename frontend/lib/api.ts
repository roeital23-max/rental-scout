import { type Listing, MOCK_LISTINGS } from "./mockData";

export type { Listing, DealLabel } from "./mockData";

export type ListingsParams = {
  city?: string;
  rooms?: string | number;
  max_price?: string | number;
};

const IS_DEV = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Fetch listings filtered by city, rooms, and max price.
 * In development: filters mock data locally.
 * In production: calls the FastAPI backend.
 */
export async function getListings(params: ListingsParams): Promise<Listing[]> {
  if (IS_DEV) {
    return filterMockListings(params);
  }

  const query = new URLSearchParams();
  if (params.city) query.set("city", String(params.city));
  if (params.rooms) query.set("rooms", String(params.rooms));
  if (params.max_price) query.set("max_price", String(params.max_price));

  const res = await fetch(`${API_BASE}/api/listings?${query.toString()}`, {
    next: { revalidate: 300 }, // cache for 5 minutes
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch listings: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch a single listing by ID.
 * In development: looks up mock data by id.
 * In production: calls the FastAPI backend.
 */
export async function getListing(id: string): Promise<Listing> {
  if (IS_DEV) {
    const found = MOCK_LISTINGS.find((l) => l.id === id);
    if (!found) throw new Error(`Listing not found: ${id}`);
    return found;
  }

  const res = await fetch(`${API_BASE}/api/listing/${id}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Listing not found: ${id}`);
  return res.json();
}

function filterMockListings(params: ListingsParams): Listing[] {
  let results = [...MOCK_LISTINGS];

  if (params.city) {
    results = results.filter((l) => l.city === params.city);
  }

  if (params.rooms) {
    const rooms = Number(params.rooms);
    results = results.filter((l) => l.rooms === rooms);
  }

  if (params.max_price) {
    const maxPrice = Number(params.max_price);
    results = results.filter((l) => l.price_nis <= maxPrice);
  }

  // Sort best deals first (most negative deal_score = furthest below median)
  return results.sort((a, b) => a.deal_score - b.deal_score);
}
