import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCountriesStore } from './useCountriesStore';
import { fetchAllCountries, fetchCountriesByName } from '../api/countriesApi';
import { queryClient } from '../query/queryClient';
import type { Country } from '../shared/types';

vi.mock('../api/countriesApi', () => ({
  fetchAllCountries: vi.fn(),
  fetchCountriesByName: vi.fn(),
}));

describe('useCountriesStore', () => {
  const mockCountries: Country[] = [
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
    queryClient.removeQueries({ queryKey: ['countries'], exact: false });
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

  it('should search countries using TanStack Query search endpoint', async () => {
    const mockSearch = fetchCountriesByName as unknown as ReturnType<
      typeof vi.fn
    >;
    mockSearch.mockResolvedValue(mockCountries);

    const store = useCountriesStore.getState();
    await store.searchCountries('Germany');

    const updatedState = useCountriesStore.getState();
    expect(updatedState.countries).toEqual(mockCountries);
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.error).toBeNull();
    expect(mockSearch).toHaveBeenCalledWith('Germany');
  });

  it('should fetch all countries when search string is empty and cache is missing', async () => {
    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(mockCountries);
    queryClient.removeQueries({ queryKey: ['countries'], exact: false });

    const store = useCountriesStore.getState();
    await store.searchCountries('   ');

    const updatedState = useCountriesStore.getState();
    expect(updatedState.countries).toEqual(mockCountries);
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should not perform search when already loading', async () => {
    useCountriesStore.setState({ isLoading: true });
    const mockSearch = fetchCountriesByName as unknown as ReturnType<
      typeof vi.fn
    >;

    const store = useCountriesStore.getState();
    await store.searchCountries('Germany');

    expect(mockSearch).not.toHaveBeenCalled();
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

  it('should handle refreshCountries error gracefully', async () => {
    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockRejectedValue(new Error('Refresh failed'));

    const store = useCountriesStore.getState();
    await store.refreshCountries();

    const updatedState = useCountriesStore.getState();
    expect(updatedState.error).toBe('Refresh failed');
    expect(updatedState.isLoading).toBe(false);
  });

  it('should set isLoading while fetchCountries is in progress', async () => {
    let resolveFetch!: (value: Country[]) => void;
    const pendingFetch = new Promise<Country[]>((resolve) => {
      resolveFetch = resolve;
    });

    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockReturnValue(pendingFetch as unknown as Promise<Country[]>);

    const store = useCountriesStore.getState();
    const fetchPromise = store.fetchCountries();

    expect(useCountriesStore.getState().isLoading).toBe(true);

    resolveFetch(mockCountries);
    await fetchPromise;

    const updatedState = useCountriesStore.getState();
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.countries).toEqual(mockCountries);
  });

  it('should use cached countries when searching with an empty string', async () => {
    queryClient.setQueryData(['countries', 'all'], mockCountries);

    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;

    const store = useCountriesStore.getState();
    await store.searchCountries('   ');

    const updatedState = useCountriesStore.getState();
    expect(updatedState.countries).toEqual(mockCountries);
    expect(updatedState.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle search error for typed search queries', async () => {
    const mockSearch = fetchCountriesByName as unknown as ReturnType<
      typeof vi.fn
    >;
    mockSearch.mockRejectedValue(new Error('Search failed'));

    const store = useCountriesStore.getState();
    await store.searchCountries('Italy');

    const updatedState = useCountriesStore.getState();
    expect(updatedState.countries).toEqual([]);
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.error).toBe('Search failed');
  });

  it('should invalidate cached countries and refetch on refreshCountries', async () => {
    const oldCountries: Country[] = [
      {
        cca3: 'ESP',
        name: { common: 'Spain', official: 'Kingdom of Spain' },
        flags: { png: 'es.png', svg: 'es.svg', alt: 'Flag of Spain' },
        capital: ['Madrid'],
        region: 'Europe',
        population: 47351567,
      },
    ];

    queryClient.setQueryData(['countries', 'all'], oldCountries);

    const newCountries: Country[] = [
      {
        cca3: 'NOR',
        name: { common: 'Norway', official: 'Kingdom of Norway' },
        flags: { png: 'no.png', svg: 'no.svg', alt: 'Flag of Norway' },
        capital: ['Oslo'],
        region: 'Europe',
        population: 5460000,
      },
    ];

    const mockFetch = fetchAllCountries as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(newCountries);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const store = useCountriesStore.getState();
    await store.refreshCountries();

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['countries'],
      exact: false,
    });
    expect(useCountriesStore.getState().countries).toEqual(newCountries);
    expect(queryClient.getQueryData(['countries', 'all'])).toEqual(
      newCountries
    );
  });
});
