import { render, screen } from '@testing-library/react';
import { SearchResultsPage } from '../src/page-components/SearchResultsPage';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../src/page-components/SearchResultsPageClient', () => ({
  SearchResultsPageClient: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-client">{children}</div>
  ),
}));

vi.mock('../src/components/SearchResultsLayoutInteractive/SearchResultsLayoutInteractive', () => ({
  SearchResultsLayoutInteractive: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout-interactive">{children}</div>
  ),
}));

vi.mock('../src/components/SearchResultsLayout/SearchResultsLayout', () => ({
  SearchResultsLayout: ({ left, details }: { left: React.ReactNode; details: React.ReactNode }) => (
    <div data-testid="search-results-layout">
      <div data-testid="left-section">{left}</div>
      <div data-testid="details-section">{details}</div>
    </div>
  ),
}));

vi.mock('../src/components/SearchForm/SearchForm', () => ({
  SearchForm: ({ search }: { search: string }) => (
    <div data-testid="search-form">{search}</div>
  ),
}));

vi.mock('../src/components/RefreshButton/RefreshButton', () => ({
  RefreshButton: () => <button type="button">Refresh</button>,
}));

vi.mock('../src/components/CountriesListServer/CountriesListServer', () => ({
  CountriesListServer: ({
    countries,
  }: {
    countries: { cca3: string; name: { common: string } }[];
  }) => (
    <div data-testid="countries-list">
      {countries.map((country) => (
        <div key={country.cca3}>{country.name.common}</div>
      ))}
    </div>
  ),
}));

vi.mock('../src/components/PaginationServer/PaginationServer', () => ({
  PaginationServer: ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalPages}
    </div>
  ),
}));

vi.mock('../src/components/SearchResultsError/SearchResultsError', () => ({
  SearchResultsError: ({ message }: { message: string }) => (
    <div data-testid="search-error">{message}</div>
  ),
}));

vi.mock('../src/components/DetailsPanelShell/DetailsPanelShell', () => ({
  DetailsPanelShell: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="details-panel-shell">{children}</div>
  ),
}));

vi.mock('../src/page-components/CountryDetails', () => ({
  CountryDetails: () => <div data-testid="country-details">Country Details</div>,
}));

const mockCountries = [
  {
    cca3: 'DEU',
    name: { common: 'Germany', official: 'Germany' },
    flags: { png: '', svg: '' },
    capital: ['Berlin'],
    region: 'Europe',
    population: 83200000,
  },
  {
    cca3: 'FRA',
    name: { common: 'France', official: 'France' },
    flags: { png: '', svg: '' },
    capital: ['Paris'],
    region: 'Europe',
    population: 67390000,
  },
  {
    cca3: 'ESP',
    name: { common: 'Spain', official: 'Spain' },
    flags: { png: '', svg: '' },
    capital: ['Madrid'],
    region: 'Europe',
    population: 47351567,
  },
];

const baseProps = {
  countries: mockCountries,
  search: '',
  currentPage: 1,
  totalPages: 1,
  queryString: '',
  error: null,
  totalCount: 3,
};

describe('SearchResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders countries list when data is loaded', () => {
    render(<SearchResultsPage {...baseProps} />);
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
  });

  it('renders search form with current search value', () => {
    render(<SearchResultsPage {...baseProps} search="ger" />);
    expect(screen.getByTestId('search-form')).toHaveTextContent('ger');
  });

  it('renders error state when error is provided', () => {
    render(<SearchResultsPage {...baseProps} countries={[]} error="Network error" />);
    expect(screen.getByTestId('search-error')).toHaveTextContent('Network error');
  });

  it('renders country details panel shell when countryCode is present', () => {
    render(<SearchResultsPage {...baseProps} countryCode="deu" />);
    expect(screen.getByTestId('details-panel-shell')).toBeInTheDocument();
    expect(screen.getByTestId('country-details')).toBeInTheDocument();
  });

  it('renders empty details panel shell when countryCode is absent', () => {
    render(<SearchResultsPage {...baseProps} />);
    expect(screen.getByTestId('details-panel-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('country-details')).not.toBeInTheDocument();
  });

  it('renders pagination when there are multiple pages', () => {
    render(<SearchResultsPage {...baseProps} totalPages={3} currentPage={2} />);
    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 2 of 3');
  });
});
