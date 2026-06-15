import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchAllCountries,
  fetchCountriesByName,
  fetchCountryByCode,
} from './countriesApi';

// ---------------------------------------------------------------------------
// Helpers to build v5-shaped mock responses
// ---------------------------------------------------------------------------

function v5ListResponse(objects: unknown[], total?: number) {
  const t = total ?? objects.length;
  return {
    data: {
      objects,
      meta: { total: t, count: objects.length, limit: 100, offset: 0, more: false },
    },
  };
}

const v5Germany = {
  codes: { alpha_3: 'DEU' },
  names: { common: 'Germany', official: 'Federal Republic of Germany' },
  flag: { url_svg: 'de.svg', description: 'German flag' },
  capitals: [{ name: 'Berlin' }],
  region: 'Europe',
  population: 83200000,
  subregion: 'Western Europe',
};

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
          json: async () => v5ListResponse([v5Germany]),
        })
      );

      const result = await fetchAllCountries();
      expect(result).toHaveLength(1);
      expect(result[0].cca3).toBe('DEU');
      expect(result[0].name.common).toBe('Germany');
      expect(result[0].flags.svg).toBe('de.svg');
      expect(result[0].capital).toEqual(['Berlin']);
      expect(result[0].region).toBe('Europe');
    });

    it('fetches additional pages when more=true', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      // First page: more=true, total=101
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            objects: [v5Germany],
            meta: { total: 101, count: 1, limit: 100, offset: 0, more: true },
          },
        }),
      });

      // Second page
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => v5ListResponse([{ ...v5Germany, codes: { alpha_3: 'FRA' }, names: { common: 'France', official: 'French Republic' } }]),
      });

      const result = await fetchAllCountries();
      expect(result).toHaveLength(2);
      expect(fetchMock).toHaveBeenCalledTimes(2);
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
        vi.fn().mockResolvedValue({ ok: false, status: 400 })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'Bad request. Please try again later.'
      );
    });

    it('throws appropriate error for HTTP 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 404 })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'The requested data could not be found.'
      );
    });

    it('throws appropriate error for HTTP 429', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 429 })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'Too many requests. Please wait a moment and try again.'
      );
    });

    it('throws appropriate error for HTTP 500', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 500 })
      );
      await expect(fetchAllCountries()).rejects.toThrow(
        'Server error.'
      );
    });
  });

  describe('fetchCountriesByName', () => {
    it('returns countries when fetch succeeds', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => v5ListResponse([v5Germany]),
        })
      );

      const result = await fetchCountriesByName('Germany');
      expect(result).toHaveLength(1);
      expect(result[0].name.common).toBe('Germany');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/countries/v5/name?q=Germany')
      );
    });

    it('returns empty array on 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 404 })
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
        vi.fn().mockResolvedValue({ ok: false, status: 400 })
      );
      await expect(fetchCountriesByName('Germany')).rejects.toThrow(
        'Bad request. Please try again later.'
      );
    });
  });

  describe('fetchCountryByCode', () => {
    const v5DetailObject = {
      codes: { alpha_3: 'MEX' },
      names: { common: 'Mexico', official: 'United Mexican States' },
      flag: { url_svg: 'mex.svg', description: 'Mexican flag' },
      capitals: [{ name: 'Mexico City' }],
      region: 'Americas',
      population: 130000000,
      subregion: 'North America',
      languages: [{ name: 'Spanish' }],
    };

    it('returns a country detail object', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => v5ListResponse([v5DetailObject]),
        })
      );

      const result = await fetchCountryByCode('mex');
      expect(result.name.common).toBe('Mexico');
      expect(result.name.official).toBe('United Mexican States');
      expect(result.flags.svg).toBe('mex.svg');
      expect(result.flags.alt).toBe('Mexican flag');
      expect(result.subregion).toBe('North America');
      expect(result.languages).toEqual(['Spanish']);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/countries/v5/codes.alpha_3/MEX')
      );
    });

    it('throws a not found error when API returns empty objects array', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => v5ListResponse([]),
        })
      );

      await expect(fetchCountryByCode('unknown')).rejects.toThrow(
        'Country not found.'
      );
    });

    it('throws error for non-ok response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 404 })
      );
      await expect(fetchCountryByCode('xyz')).rejects.toThrow(
        'The requested data could not be found.'
      );
    });

    it('throws network error when fetch fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network failure'))
      );
      await expect(fetchCountryByCode('deu')).rejects.toThrow(
        'Unable to connect to the server.'
      );
    });
  });
});
