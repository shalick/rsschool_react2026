import { Suspense } from 'react';
import { SearchResultsPage } from '../../src/page-components/SearchResultsPage';
import { getSearchResultsData } from '../../src/lib/searchParams';
import { fetchCountryByCodeServer } from '../../src/lib/countries.server';
import type { CountryDetail } from '../../src/shared/types';

export default async function CountryDetailsRoute({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { countryCode } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getSearchResultsData(resolvedSearchParams);

  let country: CountryDetail | null = null;
  let countryError: string | null = null;

  try {
    country = await fetchCountryByCodeServer(countryCode);
  } catch (err) {
    countryError = err instanceof Error ? err.message : 'Country not found in API';
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage
        {...data}
        countryCode={countryCode}
        country={country}
        countryError={countryError}
      />
    </Suspense>
  );
}
