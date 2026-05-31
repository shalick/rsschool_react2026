import { create } from 'zustand';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';
import { fetchAllCountries, fetchCountriesByName } from '../api/countriesApi';
import { queryClient } from '../query/queryClient';

interface CountriesState {
  countries: ICountry[];
  isLoading: boolean;
  error: string | null;
  fetchCountries: () => Promise<void>;
  searchCountries: (search: string) => Promise<void>;
  refreshCountries: () => Promise<void>;
}

export const useCountriesStore = create<CountriesState>((set, get) => ({
  countries: [],
  isLoading: false,
  error: null,

  fetchCountries: async () => {
    const { countries, isLoading } = get();
    if (countries.length > 0 || isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['countries', 'all'],
        queryFn: fetchAllCountries,
        retry: false,
      });
      set({ countries: data, isLoading: false });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false });
    }
  },

  searchCountries: async (search: string) => {
    const trimmedSearch = search.trim();
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    if (!trimmedSearch) {
      try {
        const cachedCountries = queryClient.getQueryData<ICountry[]>([
          'countries',
          'all',
        ]);

        if (cachedCountries) {
          set({ countries: cachedCountries, isLoading: false });
          return;
        }

        const data = await queryClient.fetchQuery({
          queryKey: ['countries', 'all'],
          queryFn: fetchAllCountries,
          retry: false,
        });

        set({ countries: data, isLoading: false });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        set({ error: errorMessage, isLoading: false });
      }

      return;
    }

    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['countries', 'search', trimmedSearch],
        queryFn: () => fetchCountriesByName(trimmedSearch),
        retry: false,
      });
      set({ countries: data, isLoading: false });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false });
    }
  },

  refreshCountries: async () => {
    set({ isLoading: true, error: null });
    try {
      await queryClient.invalidateQueries({
        queryKey: ['countries'],
        exact: false,
      });
      const data = await queryClient.fetchQuery({
        queryKey: ['countries', 'all'],
        queryFn: fetchAllCountries,
        retry: false,
      });
      set({ countries: data, isLoading: false });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
