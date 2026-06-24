import { mockCountries, mockCountryDetails } from '../api/mockCountries';
import type { Country, CountryDetail } from '../shared/types';

const UPSTREAM = 'https://restcountries.com/v3.1';
const TIMEOUT_MS = 8000;

const getErrorMessage = (status: number): string => {
  switch (true) {
    case status === 400: return 'Bad request. Please try again later.';
    case status === 404: return 'The requested data could not be found.';
    case status === 429: return 'Too many requests. Please wait a moment and try again.';
    case status >= 500: return 'Server error. Please try again later.';
    default: return `Unexpected error (status ${status}).`;
  }
};

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAllCountriesServer(): Promise<Country[]> {
  try {
    const url = `${UPSTREAM}/all?fields=name,flags,capital,region,population,cca3`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data)) return data as Country[];
    return mockCountries;
  } catch {
    return mockCountries;
  }
}

export async function fetchCountriesByNameServer(name: string): Promise<Country[]> {
  try {
    const url = `${UPSTREAM}/name/${encodeURIComponent(name)}?fields=name,flags,capital,region,population,cca3`;
    const response = await fetchWithTimeout(url);
    if (response.status === 404) return [];
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? (data as Country[]) : [];
  } catch {
    const query = name.toLowerCase();
    return mockCountries.filter(
      (c) => c.name.common.toLowerCase().includes(query) || (c.name.official ?? '').toLowerCase().includes(query)
    );
  }
}

export async function fetchCountryByCodeServer(code: string): Promise<CountryDetail> {
  const normalized = code.toLowerCase();
  try {
    const url = `${UPSTREAM}/alpha/${encodeURIComponent(normalized)}?fields=name,flags,subregion,languages,cca3`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(getErrorMessage(response.status));
    const data = await response.json();
    if (Array.isArray(data)) {
      if (data.length === 0) throw new Error('Country not found');
      return data[0] as CountryDetail;
    }
    if (data && typeof data === 'object') return data as CountryDetail;
    throw new Error('Country not found');
  } catch (err) {
    const mock = mockCountryDetails[normalized];
    if (mock) return mock;
    return {
      name: { common: normalized.toUpperCase(), official: normalized.toUpperCase() },
      flags: { svg: '', alt: '' },
      subregion: 'N/A',
      languages: undefined,
    };
  }
}
