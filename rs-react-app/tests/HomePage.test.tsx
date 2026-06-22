import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '../src/page-components/HomePage';
import { useParams, useLocation } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();
window.scrollTo = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(),
    useLocation: vi.fn(() => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    })),
  };
});

vi.mock('../src/pages/HomePage.module.css', () => ({
  default: {
    homeLayout: 'homeLayout',
    splitActive: 'splitActive',
    leftSection: 'leftSection',
    rightSection: 'rightSection',
  },
}));

vi.mock('../src/store/useCountriesStore', () => ({
  useCountriesStore: vi.fn(),
}));

vi.mock('../src/components/CountriesCardsList/CountriesCardsList', () => ({
  CardsList: ({ countries, isLoading, error }) => (
    <div data-testid="cards-list">
      {isLoading && <span>Loading...</span>}
      {error && <span>Error: {error}</span>}
      {!isLoading && !error && (
        <ul>
          {countries.map((c) => (
            <li key={c.cca3}>{c.name.common}</li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

vi.mock('../src/components/Search/Search', () => ({
  Search: ({ searchStr, onSearchChange }) => (
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
  Pagination: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button data-testid="next-page" onClick={() => onPageChange(currentPage + 1)}>
        Next
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  ),
}));

vi.mock('../src/components/ErrorBoundary/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }) => <div data-testid="error-boundary">{children}</div>,
}));

vi.mock('../src/components/ErrorSimulator/ErrorSimulator', () => ({
  ErrorSimulator: () => <div data-testid="error-simulator">Error Simulator</div>,
}));

describe('HomePage', () => {
  const mockCountries = [
    { cca3: 'DEU', name: { common: 'Germany' }, flags: {}, capital: ['Berlin'], region: 'Europe', population: 83200000 },
    { cca3: 'FRA', name: { common: 'France' }, flags: {}, capital: ['Paris'], region: 'Europe', population: 67390000 },
    { cca3: 'ESP', name: { common: 'Spain' }, flags: {}, capital: ['Madrid'], region: 'Europe', population: 47351567 },
  ];

  const mockUseCountriesStore = vi.mocked(require('../src/store/useCountriesStore').useCountriesStore);
  const mockUseParams = vi.mocked(useParams);
  const mockUseLocation = vi.mocked(useLocation);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({});

    mockUseLocation.mockReturnValue({ pathname: '/', search: '', hash: '', state: null, key: 'default' });

    mockUseCountriesStore.mockReturnValue({ countries: mockCountries, isLoading: false, error: null, fetchCountries: vi.fn(), searchCountries: vi.fn(), refreshCountries: vi.fn() });
    mockNavigate.mockClear();
  });

  const renderHomePage = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route path=":countryCode" element={<div data-testid="details-outlet">Country Details</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders countries list when data is loaded', () => {
    renderHomePage();
    expect(screen.getByTestId('cards-list')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
  });
});
