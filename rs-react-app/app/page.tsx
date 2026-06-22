import { Suspense } from 'react';
import { SearchResultsPage } from '../src/page-components/SearchResultsPage';
import { getSearchResultsData } from '../src/lib/searchParams';

export default async function HomeRoute({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const data = await getSearchResultsData(resolvedSearchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage {...data} />
    </Suspense>
  );
}
