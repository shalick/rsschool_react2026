import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { ICountry } from './components/CountriesCardsList/CountriesCardsList';
import { fetchAllCountries, fetchCountriesByName } from './api/countriesApi';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./api/countriesApi', () => ({
  fetchAllCountries: vi.fn(),
  fetchCountriesByName: vi.fn(),
}));

vi.mock('./components/Search/Search', () => ({
  Search: ({ searchStr, onSearchChange, onSearch }: any) => (
    <div data-testid="mock-search">
      <input
        data-testid="search-input"
        value={searchStr}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button
        data-testid="search-button"
        onClick={() => onSearch(searchStr.trim())}
      >
        Search
      </button>
    </div>
  ),
}));

vi.mock('./components/CountriesCardsList/CountriesCardsList', () => ({
  CardsList: ({ countries, isLoading, error }: any) => (
    <div data-testid="mock-cards-list">
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

vi.mock('./components/ErrorSimulator/ErrorSimulator', () => ({
  ErrorSimulator: () => (
    <div data-testid="error-simulator">Error Simulator</div>
  ),
}));

vi.mock('./components/ErrorBoundary/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App', () => {
  const mockFetchAllCountries = fetchAllCountries as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockFetchCountriesByName =
    fetchCountriesByName as unknown as ReturnType<typeof vi.fn>;

  const mockCountries: ICountry[] = [
    {
      cca3: 'DEU',
      name: { common: 'Germany' },
      flags: { png: 'de.png', svg: 'de.svg' },
      capital: ['Berlin'],
      region: 'Europe',
      population: 83200000,
    },
    {
      cca3: 'FRA',
      name: { common: 'France' },
      flags: { png: 'fr.png', svg: 'fr.svg' },
      capital: ['Paris'],
      region: 'Europe',
      population: 67390000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetchAllCountries.mockResolvedValue(mockCountries);
  });

  it('loads all countries on mount and displays them', async () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });

  it('handles API error when fetching all countries', async () => {
    mockFetchAllCountries.mockRejectedValueOnce(new Error('Network error'));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('persists searchStr in localStorage and restores it', async () => {
    localStorageMock.setItem('searchStr', 'germany');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toHaveValue('germany');
    });
  });

  it('updates localStorage when searchStr changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() =>
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    );
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'france');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'searchStr',
      'france'
    );
  });

  it('performs search and displays results (with loading state)', async () => {
    const user = userEvent.setup();
    const searchResults = [mockCountries[1]];

    let resolvePromise: (value: typeof searchResults) => void;
    const delayedPromise = new Promise<typeof searchResults>((resolve) => {
      resolvePromise = resolve;
    });
    mockFetchCountriesByName.mockImplementationOnce(() => delayedPromise);

    render(<App />);
    await waitFor(() =>
      expect(screen.getByText('Germany')).toBeInTheDocument()
    );

    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');
    await user.type(searchInput, 'France');
    await user.click(searchButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    resolvePromise!(searchResults);
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
    });
    expect(mockFetchCountriesByName).toHaveBeenCalledWith('France');
  });

  it('shows error if search fails', async () => {
    const user = userEvent.setup();
    mockFetchCountriesByName.mockRejectedValueOnce(
      new Error('No countries found')
    );

    render(<App />);
    await waitFor(() =>
      expect(screen.getByText('Germany')).toBeInTheDocument()
    );

    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');
    await user.type(searchInput, 'Unknown');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Error: No countries found')).toBeInTheDocument();
    });
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
  });

  it('resets searchResults to null when searching empty string', async () => {
    const user = userEvent.setup();
    const searchResults = [mockCountries[1]];
    mockFetchCountriesByName.mockResolvedValueOnce(searchResults);

    render(<App />);
    await waitFor(() =>
      expect(screen.getByText('Germany')).toBeInTheDocument()
    );

    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');

    await user.type(searchInput, 'France');
    await user.click(searchButton);
    await waitFor(() => expect(screen.getByText('France')).toBeInTheDocument());

    await user.clear(searchInput);
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    expect(screen.queryByText(/No countries found/i)).not.toBeInTheDocument();
  });

  it('does not repeat the same search term', async () => {
    const user = userEvent.setup();
    mockFetchCountriesByName.mockResolvedValueOnce([mockCountries[1]]);

    render(<App />);
    await waitFor(() =>
      expect(screen.getByText('Germany')).toBeInTheDocument()
    );

    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');
    await user.type(searchInput, 'France');
    await user.click(searchButton);
    await waitFor(() => expect(screen.getByText('France')).toBeInTheDocument());

    await user.click(searchButton);
    expect(mockFetchCountriesByName).toHaveBeenCalledTimes(1);
  });

  it('toggles error simulation and shows ErrorSimulator', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() =>
      expect(screen.getByTestId('mock-cards-list')).toBeInTheDocument()
    );

    const toggleButton = screen.getByRole('button', {
      name: /Test Error Boundary/i,
    });
    await user.click(toggleButton);
    expect(screen.getByTestId('error-simulator')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-search')).not.toBeInTheDocument();

    const resetButton = screen.getByRole('button', {
      name: /Reset Error Simulation/i,
    });
    await user.click(resetButton);
    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
    expect(screen.queryByTestId('error-simulator')).not.toBeInTheDocument();
  });

  it('saves searchStr to localStorage on unmount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await waitFor(() =>
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    );
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'saved');
    unmount();
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
      'searchStr',
      'saved'
    );
  });
});
