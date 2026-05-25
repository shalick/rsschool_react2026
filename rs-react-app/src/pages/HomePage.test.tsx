import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useCountriesStore } from '../store/useCountriesStore';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(),
    useLocation: vi.fn(() => ({ search: '' })),
  };
});

import { useParams, useLocation } from 'react-router-dom';

vi.mock('./HomePage.module.css', () => ({
  default: {
    homeLayout: 'homeLayout',
    splitActive: 'splitActive',
    leftSection: 'leftSection',
    rightSection: 'rightSection',
  },
}));

vi.mock('../store/useCountriesStore', () => ({
  useCountriesStore: vi.fn(),
}));

vi.mock('../components/CountriesCardsList/CountriesCardsList', () => ({
  CardsList: ({ countries, isLoading, error }: any) => (
    <div data-testid="cards-list">
      {isLoading && <span>Loading...</span>}
      {error && <span>Error: {error}</span>}
      {!isLoading && !error && (
        <ul>
          {countries.map((c: ICountry) => (
            <li key={c.cca3}>{c.name.common}</li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

vi.mock('../components/Search/Search', () => ({
  Search: ({ searchStr, onSearchChange, onSearch }: any) => (
    <div data-testid="search">
      <input
        data-testid="search-input"
        value={searchStr}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button data-testid="search-button" onClick={() => onSearch(searchStr)}>
        Search
      </button>
    </div>
  ),
}));

vi.mock('../components/Pagination/Pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button
        data-testid="prev-page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        data-testid="next-page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  ),
}));

vi.mock('../components/ErrorBoundary/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('../components/ErrorSimulator/ErrorSimulator', () => ({
  ErrorSimulator: () => (
    <div data-testid="error-simulator">Error Simulator</div>
  ),
}));

describe('HomePage', () => {
  const mockCountries: ICountry[] = [
    {
      cca3: 'DEU',
      name: { common: 'Germany', official: 'Federal Republic of Germany' },
      flags: { png: 'de.png', svg: 'de.svg' },
      capital: ['Berlin'],
      region: 'Europe',
      population: 83200000,
    },
    {
      cca3: 'FRA',
      name: { common: 'France', official: 'French Republic' },
      flags: { png: 'fr.png', svg: 'fr.svg' },
      capital: ['Paris'],
      region: 'Europe',
      population: 67390000,
    },
    {
      cca3: 'ESP',
      name: { common: 'Spain', official: 'Kingdom of Spain' },
      flags: { png: 'es.png', svg: 'es.svg' },
      capital: ['Madrid'],
      region: 'Europe',
      population: 47351567,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useCountriesStore as any).mockReturnValue({
      countries: mockCountries,
      isLoading: false,
      error: null,
    });
    (useParams as any).mockReturnValue({});
    (useLocation as any).mockReturnValue({ search: '' });
    mockNavigate.mockClear();
  });

  const renderHomePage = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route
              path=":countryCode"
              element={<div data-testid="details-outlet">Country Details</div>}
            />
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

  it('shows loader when isLoading is true', () => {
    (useCountriesStore as any).mockReturnValue({
      countries: [],
      isLoading: true,
      error: null,
    });
    renderHomePage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    (useCountriesStore as any).mockReturnValue({
      countries: [],
      isLoading: false,
      error: 'Failed to fetch countries',
    });
    renderHomePage();
    expect(
      screen.getByText('Error: Failed to fetch countries')
    ).toBeInTheDocument();
  });

  it('filters countries based on search input', async () => {
    renderHomePage();
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'ger' } });
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.queryByText('France')).not.toBeInTheDocument();
      expect(screen.queryByText('Spain')).not.toBeInTheDocument();
    });
  });

  it('resets search results when search is cleared', async () => {
    renderHomePage();
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'ger' } });
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.getByText('Spain')).toBeInTheDocument();
    });
  });

  it('paginates countries correctly', () => {
    const manyCountries = Array.from({ length: 15 }, (_, i) => ({
      ...mockCountries[0],
      cca3: `CTA${i}`,
      name: { common: `Country ${i}` },
    }));
    (useCountriesStore as any).mockReturnValue({
      countries: manyCountries,
      isLoading: false,
      error: null,
    });
    renderHomePage();
    expect(screen.getByText('Country 0')).toBeInTheDocument();
    expect(screen.getByText('Country 11')).toBeInTheDocument();
    expect(screen.queryByText('Country 12')).not.toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('next-page'));
    expect(screen.getByText('Country 12')).toBeInTheDocument();
  });

  it('does not show pagination when total pages <= 1', () => {
    renderHomePage();
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('displays details panel when countryCode param is present', () => {
    (useParams as any).mockReturnValue({ countryCode: 'DEU' });
    renderHomePage(['/DEU']);
    expect(screen.getByTestId('details-outlet')).toBeInTheDocument();
  });

  it('closes details panel when clicking on left section while details are open', () => {
    (useParams as any).mockReturnValue({ countryCode: 'DEU' });
    renderHomePage(['/DEU']);
    const leftSection = document.querySelector('.leftSection') as HTMLElement;
    fireEvent.click(leftSection);
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: '/', search: '' });
  });

  it('does not close details panel when clicking inside right section', () => {
    (useParams as any).mockReturnValue({ countryCode: 'DEU' });
    renderHomePage(['/DEU']);
    const rightSection = document.querySelector('.rightSection') as HTMLElement;
    fireEvent.click(rightSection);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('toggles error simulation when the error button is clicked', () => {
    renderHomePage();
    const errorButton = screen.getByText('⚠️ Test Error Boundary');
    expect(screen.queryByTestId('error-simulator')).not.toBeInTheDocument();
    fireEvent.click(errorButton);
    expect(screen.getByTestId('error-simulator')).toBeInTheDocument();
    fireEvent.click(screen.getByText('🔄 Reset Error Simulation'));
    expect(screen.getByTestId('search')).toBeInTheDocument();
  });
});
