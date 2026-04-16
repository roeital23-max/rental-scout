import { getListings } from "@/lib/api";
import ResultsView from "@/components/ResultsView";

type SearchParams = {
  city?: string;
  rooms?: string;
  max_price?: string;
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const listings = await getListings(params);
  return <ResultsView listings={listings} searchParams={params} />;
}
