export type DealLabel = "great_deal" | "fair" | "overpriced" | "roommate" | "parking";

export type ListingType = "apartment" | "roommate" | "parking";

export type Feature = "balcony" | "parking" | "garden" | "mamad" | "building_shelter" | "public_shelter";

export type Listing = {
  id: string;
  url: string;
  city: string;
  neighborhood: string;
  rooms: number;
  sqm: number;
  floor: number;
  price_nis: number;
  deal_score: number; // % deviation from neighborhood median (negative = below median = good deal)
  deal_label: DealLabel;
  listing_type: ListingType;
  listed_at: string;
  features: Feature[];
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "yad2-1001",
    url: "https://www.yad2.co.il/item/1001",
    city: "tel_aviv",
    neighborhood: "פלורנטין",
    rooms: 3,
    sqm: 72,
    floor: 2,
    price_nis: 5200,
    deal_score: -18,
    deal_label: "great_deal",
    listing_type: "apartment",
    listed_at: "2026-04-08",
    features: ["balcony", "mamad"],
  },
  {
    id: "yad2-1002",
    url: "https://www.yad2.co.il/item/1002",
    city: "tel_aviv",
    neighborhood: "רמת אביב",
    rooms: 2,
    sqm: 55,
    floor: 4,
    price_nis: 6800,
    deal_score: 5,
    deal_label: "fair",
    listing_type: "apartment",
    listed_at: "2026-04-07",
    features: ["parking", "building_shelter"],
  },
  {
    id: "yad2-1003",
    url: "https://www.yad2.co.il/item/1003",
    city: "tel_aviv",
    neighborhood: "נווה צדק",
    rooms: 3,
    sqm: 80,
    floor: 1,
    price_nis: 9500,
    deal_score: 28,
    deal_label: "overpriced",
    listing_type: "apartment",
    listed_at: "2026-04-06",
    features: ["garden", "mamad", "parking"],
  },
  {
    id: "yad2-1004",
    url: "https://www.yad2.co.il/item/1004",
    city: "tel_aviv",
    neighborhood: "פלורנטין",
    rooms: 2,
    sqm: 48,
    floor: 3,
    price_nis: 4600,
    deal_score: -12,
    deal_label: "great_deal",
    listing_type: "apartment",
    listed_at: "2026-04-09",
    features: ["balcony", "building_shelter"],
  },
  {
    id: "yad2-1005",
    url: "https://www.yad2.co.il/item/1005",
    city: "jerusalem",
    neighborhood: "נחלאות",
    rooms: 2,
    sqm: 52,
    floor: 2,
    price_nis: 4100,
    deal_score: -9,
    deal_label: "great_deal",
    listing_type: "apartment",
    listed_at: "2026-04-08",
    features: ["mamad"],
  },
  {
    id: "yad2-1006",
    url: "https://www.yad2.co.il/item/1006",
    city: "jerusalem",
    neighborhood: "בקעה",
    rooms: 3,
    sqm: 85,
    floor: 0,
    price_nis: 5800,
    deal_score: 3,
    deal_label: "fair",
    listing_type: "apartment",
    listed_at: "2026-04-07",
    features: ["garden", "parking", "mamad"],
  },
  {
    id: "yad2-1007",
    url: "https://www.yad2.co.il/item/1007",
    city: "jerusalem",
    neighborhood: "רחביה",
    rooms: 4,
    sqm: 110,
    floor: 3,
    price_nis: 9200,
    deal_score: 22,
    deal_label: "overpriced",
    listing_type: "apartment",
    listed_at: "2026-04-05",
    features: ["balcony", "mamad", "parking"],
  },
  {
    id: "yad2-1008",
    url: "https://www.yad2.co.il/item/1008",
    city: "haifa",
    neighborhood: "כרמל",
    rooms: 3,
    sqm: 90,
    floor: 5,
    price_nis: 3800,
    deal_score: -22,
    deal_label: "great_deal",
    listing_type: "apartment",
    listed_at: "2026-04-09",
    features: ["balcony", "building_shelter"],
  },
  {
    id: "yad2-1009",
    url: "https://www.yad2.co.il/item/1009",
    city: "haifa",
    neighborhood: "נווה שאנן",
    rooms: 2,
    sqm: 60,
    floor: 1,
    price_nis: 2900,
    deal_score: 1,
    deal_label: "fair",
    listing_type: "apartment",
    listed_at: "2026-04-08",
    features: ["public_shelter"],
  },
  {
    id: "yad2-1010",
    url: "https://www.yad2.co.il/item/1010",
    city: "beer_sheva",
    neighborhood: "נאות לון",
    rooms: 4,
    sqm: 100,
    floor: 2,
    price_nis: 3400,
    deal_score: -14,
    deal_label: "great_deal",
    listing_type: "apartment",
    listed_at: "2026-04-07",
    features: ["garden", "parking", "mamad"],
  },
];
