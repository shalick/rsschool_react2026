import { create } from 'zustand';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';
import { fetchAllCountries } from '../api/countriesApi';

interface CountriesState {
  countries: ICountry[];
  isLoading: boolean;
  error: string | null;
  fetchCountries: () => Promise<void>;
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
      const data = await fetchAllCountries();
      set({ countries: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
