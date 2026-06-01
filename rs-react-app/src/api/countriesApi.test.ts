import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchAllCountries,
  fetchCountriesByName,
  fetchCountryByCode,
} from './countriesApi';
import type { Country } from '../shared/types';

const mockCountries: Country[] = [
  {
    cca3: 'DEU',
    name: { common: 'Germany' },
    flags: { png: 'de.png', svg: 'de.svg' },
    capital: ['Berlin'],
    region: 'Europe',
    population: 83200000,
  },
];

describe('countriesApi', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchAllCountries', () => {
    it('returns countries when fetch succeeds', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockCountries,
        })
      );

      const result = await fetchAllCountries();
      expect(result).toEqual(mockCountries);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/all?fields=name,flags,capital,region,population,cca3'
      );
    });

    it('throws network error when fetch fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network failure'))
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    });

    it('throws appropriate error for HTTP 400', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
        })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'Bad request. Please try again later.'
      );
    });

    it('throws appropriate error for HTTP 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
        })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'The requested data could not be found.'
      );
    });

    it('throws appropriate error for HTTP 429', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
        })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'Too many requests. Please wait a moment and try again.'
      );
    });

    it('throws appropriate error for HTTP 500', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'Server error. We’re working on it – please try again soon.'
      );
    });
  });

  describe('fetchCountriesByName', () => {
    it('returns countries when fetch succeeds', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockCountries,
        })
      );

      const result = await fetchCountriesByName('Germany');
      expect(result).toEqual(mockCountries);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/name/Germany?fields=name,flags,capital,region,population,cca3'
      );
    });

    it('returns empty array on 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
        })
      );
      const result = await fetchCountriesByName('NotFound');
      expect(result).toEqual([]);
    });

    it('throws network error when fetch fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network failure'))
      );
      await expect(fetchCountriesByName('Germany')).rejects.toThrow(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    });

    it('throws error for other HTTP errors (e.g., 400)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
        })
      );
      await expect(fetchCountriesByName('Germany')).rejects.toThrow(
        'Bad request. Please try again later.'
      );
    });
  });

  describe('fetchCountryByCode', () => {
    it('returns a country when API returns an object', async () => {
      const mockCountryData = {
        name: { common: 'Mexico', official: 'United Mexican States' },
        flags: { svg: 'mex.svg', alt: 'Mexican flag' },
        subregion: 'North America',
        languages: { spa: 'Spanish' },
        cca3: 'MEX',
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockCountryData,
        })
      );

      const result = await fetchCountryByCode('mex');
      expect(result).toEqual(mockCountryData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha/mex?fields=name,flags,subregion,languages,cca3'
      );
    });

    it('returns a country when API returns an array', async () => {
      const mockCountryData = [
        {
          name: { common: 'Mexico', official: 'United Mexican States' },
          flags: { svg: 'mex.svg', alt: 'Mexican flag' },
          subregion: 'North America',
          languages: { spa: 'Spanish' },
          cca3: 'MEX',
        },
      ];

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockCountryData,
        })
      );

      const result = await fetchCountryByCode('mex');
      expect(result).toEqual(mockCountryData[0]);
    });

    it('throws a not found error when API returns empty array', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [],
        })
      );

      await expect(fetchCountryByCode('unknown')).rejects.toThrow(
        'Country not found in API'
      );
    });
  });
});
