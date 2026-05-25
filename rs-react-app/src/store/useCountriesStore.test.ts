import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCountriesStore } from './useCountriesStore';
import { fetchAllCountries } from '../api/countriesApi';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';

vi.mock('../api/countriesApi', () => ({
  fetchAllCountries: vi.fn(),
}));

describe('useCountriesStore', () => {
  const mockCountries: ICountry[] = [
    {
      cca3: 'DEU',
      name: { common: 'Germany', official: 'Federal Republic of Germany' },
      flags: { png: 'de.png', svg: 'de.svg', alt: 'Flag of Germany' },
      capital: ['Berlin'],
      region: 'Europe',
      population: 83200000,
    },
    {
      cca3: 'FRA',
      name: { common: 'France', official: 'French Republic' },
      flags: { png: 'fr.png', svg: 'fr.svg', alt: 'Flag of France' },
      capital: ['Paris'],
      region: 'Europe',
      population: 67390000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state using Zustand's setState
    useCountriesStore.setState({
      countries: [],
      isLoading: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useCountriesStore.getState();
    expect(state.countries).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fetch countries successfully', async () => {
    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(mockCountries);

    const store = useCountriesStore.getState();
    await store.fetchCountries();

    const updatedState = useCountriesStore.getState();
    expect(updatedState.countries).toEqual(mockCountries);
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should not fetch if countries already loaded', async () => {
    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(mockCountries);

    // Set countries directly via setState
    useCountriesStore.setState({ countries: mockCountries });
    const store = useCountriesStore.getState();
    await store.fetchCountries();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(useCountriesStore.getState().isLoading).toBe(false);
  });

  it('should not fetch if already loading', async () => {
    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves

    useCountriesStore.setState({ isLoading: true });
    const store = useCountriesStore.getState();
    await store.fetchCountries();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    const errorMessage = 'Network error';
    mockFetch.mockRejectedValue(new Error(errorMessage));

    const store = useCountriesStore.getState();
    await store.fetchCountries();

    const updatedState = useCountriesStore.getState();
    expect(updatedState.countries).toEqual([]);
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.error).toBe(errorMessage);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error rejection gracefully', async () => {
    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockRejectedValue('String error');

    const store = useCountriesStore.getState();
    await store.fetchCountries();

    const updatedState = useCountriesStore.getState();
    expect(updatedState.error).toBe('An unknown error occurred');
    expect(updatedState.isLoading).toBe(false);
  });
});
