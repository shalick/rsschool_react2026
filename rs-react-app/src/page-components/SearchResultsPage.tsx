import { SearchResultsLayout } from '../components/SearchResultsLayout/SearchResultsLayout';
import { SearchResultsLayoutInteractive } from '../components/SearchResultsLayoutInteractive/SearchResultsLayoutInteractive';
import { DetailsPanelShell } from '../components/DetailsPanelShell/DetailsPanelShell';
import { CountriesListServer } from '../components/CountriesListServer/CountriesListServer';
import { SearchFormClient } from '../components/SearchForm/SearchFormClient';
import { PaginationServer } from '../components/PaginationServer/PaginationServer';
import { RefreshButton } from '../components/RefreshButton/RefreshButton';
import { SearchResultsError } from '../components/SearchResultsError/SearchResultsError';
import { CountryDetailsServer } from '../components/CountryDetailsServer/CountryDetailsServer';
import { SearchResultsPageClient } from './SearchResultsPageClient';
import type { SearchResultsData } from '../lib/searchParams';
import type { CountryDetail } from '../shared/types';

interface SearchResultsPageProps extends SearchResultsData {
  countryCode?: string;
  country?: CountryDetail | null;
  countryError?: string | null;
}

export function SearchResultsPage({
  countries,
  search,
  currentPage,
  totalPages,
  queryString,
  error,
  countryCode,
  country,
  countryError,
}: SearchResultsPageProps) {
  const basePath = countryCode ? `/${countryCode.toLowerCase()}` : '/';

  return (
    <SearchResultsPageClient>
      <SearchResultsLayoutInteractive
        countryCode={countryCode}
        queryString={queryString}
      >
        <SearchResultsLayout
          left={
            <>
              <SearchFormClient
                search={search}
                activeCountryCode={countryCode}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <RefreshButton />
              </div>
              {error ? (
                <SearchResultsError message={error} />
              ) : (
                <CountriesListServer
                  countries={countries}
                  search={search}
                  currentPage={currentPage}
                />
              )}
              {!error && (
                <PaginationServer
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={basePath}
                  search={search}
                />
              )}
            </>
          }
          details={
            <DetailsPanelShell>
              {countryCode ? (
                <CountryDetailsServer
                  countryCode={countryCode}
                  country={country ?? null}
                  countryError={countryError ?? null}
                  queryString={queryString}
                />
              ) : null}
            </DetailsPanelShell>
          }
        />
      </SearchResultsLayoutInteractive>
    </SearchResultsPageClient>
  );
}
