import { type BenefitProgram, MOCK_BENEFITS } from "./mockBenefits";

export type { BenefitProgram };

export type BenefitsParams = {
  income?: number;
  family_size?: number;
  owns_home?: boolean;
  is_oleh?: boolean;
};

const IS_DEV = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Fetch benefit programs matching eligibility criteria.
 * In development: returns all mock programs (no filtering).
 * In production: calls the FastAPI backend.
 */
export async function getBenefits(params: BenefitsParams): Promise<BenefitProgram[]> {
  if (IS_DEV) {
    return MOCK_BENEFITS;
  }

  const query = new URLSearchParams();
  if (params.income !== undefined) query.set("income", String(params.income));
  if (params.family_size !== undefined) query.set("family_size", String(params.family_size));
  if (params.owns_home !== undefined) query.set("owns_home", String(params.owns_home));
  if (params.is_oleh !== undefined) query.set("is_oleh", String(params.is_oleh));

  const res = await fetch(`${API_BASE}/api/benefits?${query.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch benefits: ${res.status}`);
  }

  return res.json();
}
