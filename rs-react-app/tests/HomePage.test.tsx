import { render, screen } from '@testing-library/react';
import { HomePage } from '../src/page-components/HomePage';
import { useCountriesStore } from '../src/store/useCountriesStore';
import { describe, expect, it, vi, beforeEach } from 'vitest';

window.scrollTo = vi.fn();

const mockPush = vi.fn();
const mockParams: Record<string, string> = {};
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

vi.mock('../src/store/useCountriesStore', () => ({
  useCountriesStore: vi.fn(),
}));

vi.mock('../src/page-components/HomePage.module.css', () => ({
  default: {
    homeLayout: 'homeLayout',
    splitActive: 'splitActive',
    leftSection: 'leftSection',
    rightSection: 'rightSection',
  },
}));

vi.mock('../src/components/CountriesCardsList/CountriesCardsList', () => ({
  CardsList: ({
    countries,
    isLoading,
    error,
  }: {
    countries: { cca3: string; name: { common: string } }[];
    isLoading: boolean;
    error: string | null;
  }) => (
    <div data-testid="cards-list">
      {isLoading && <span>Loading...</span>}
      {error && <span>Error: {error}</span>}
      {!isLoading &&
        !error &&
        countries.map((c) => <div key={c.cca3}>{c.name.common}</div>)}
    </div>
  ),
}));

vi.mock('../src/components/Search/Search', () => ({
  Search: ({
    searchStr,
    onSearchChange,
  }: {
    searchStr: string;
    onSearchChange: (v: string) => void;
  }) => (
    <div data-testid="search">
      <input
        data-testid="search-input"
        value={searchStr}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('../src/components/Pagination/Pagination', () => ({
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  ),
}));

vi.mock('../src/components/ErrorBoundary/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('../src/components/ErrorSimulator/ErrorSimulator', () => ({
  ErrorSimulator: () => (
    <div data-testid="error-simulator">Error Simulator</div>
  ),
}));

vi.mock('../src/page-components/CountryDetails', () => ({
  CountryDetails: () => <div data-testid="country-details">Country Details</div>,
}));

const mockCountries = [
  {
    cca3: 'DEU',
    name: { common: 'Germany' },
    flags: {},
    capital: ['Berlin'],
    region: 'Europe',
    population: 83200000,
  },
  {
    cca3: 'FRA',
    name: { common: 'France' },
    flags: {},
    capital: ['Paris'],
    region: 'Europe',
    population: 67390000,
  },
  {
    cca3: 'ESP',
    name: { common: 'Spain' },
    flags: {},
    capital: ['Madrid'],
    region: 'Europe',
    population: 47351567,
  },
];

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete mockParams.countryCode;
    vi.mocked(useCountriesStore).mockReturnValue({
      countries: mockCountries,
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });
  });

  it('renders countries list when data is loaded', () => {
    render(<HomePage />);
    expect(screen.getByTestId('cards-list')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
  });

  it('renders search component', () => {
    render(<HomePage />);
    expect(screen.getByTestId('search')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    vi.mocked(useCountriesStore).mockReturnValue({
      countries: [],
      isLoading: true,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });
    render(<HomePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state when error is provided', () => {
    vi.mocked(useCountriesStore).mockReturnValue({
      countries: [],
      isLoading: false,
      error: 'Network error',
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });
    render(<HomePage />);
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('renders country details panel when countryCode param is present', () => {
    mockParams.countryCode = 'deu';
    render(<HomePage />);
    expect(screen.getByTestId('country-details')).toBeInTheDocument();
  });

  it('does not render details panel when countryCode param is absent', () => {
    render(<HomePage />);
    expect(screen.queryByTestId('country-details')).not.toBeInTheDocument();
  });
});
