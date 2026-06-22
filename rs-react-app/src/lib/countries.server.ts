import { mockCountries, mockCountryDetails } from '../api/mockCountries';
import type { Country, CountryDetail } from '../shared/types';

const UPSTREAM = 'https://restcountries.com/v3.1';
const TIMEOUT_MS = 5000;
const LIST_FIELDS = 'name,flags,capital,region,population,cca3';
const DETAIL_FIELDS = 'name,flags,subregion,languages,cca3';

const getErrorMessage = (status: number): string => {
  switch (true) {
    case status === 400:
      return 'Bad request. Please try again later.';
    case status === 404:
      return 'The requested data could not be found.';
    case status === 429:
      return 'Too many requests. Please wait a moment and try again.';
    case status >= 500:
      return 'Server error. We are working on it - please try again soon.';
    default:
      return `Unexpected error (status ${status}). Please try again.`;
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

function mockCountriesByName(name: string): Country[] {
  const query = name.toLowerCase();
  return mockCountries.filter(
    (c) =>
      c.name.common.toLowerCase().includes(query) ||
      (c.name.official ?? '').toLowerCase().includes(query)
  );
}

function mockCountryByCode(code: string): CountryDetail | null {
  return mockCountryDetails[code.toLowerCase()] ?? null;
}

export async function fetchAllCountriesServer(): Promise<Country[]> {
  const url = `${UPSTREAM}/all?fields=${LIST_FIELDS}`;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`upstream ${response.status}`);
    }
    return response.json();
  } catch {
    return mockCountries;
  }
}

export async function fetchCountriesByNameServer(name: string): Promise<Country[]> {
  const url = `${UPSTREAM}/name/${encodeURIComponent(name)}?fields=${LIST_FIELDS}`;

  try {
    const response = await fetchWithTimeout(url);
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      throw new Error(`upstream ${response.status}`);
    }
    return response.json();
  } catch {
    return mockCountriesByName(name);
  }
}

export async function fetchCountryByCodeServer(code: string): Promise<CountryDetail> {
  const normalizedCode = code.toLowerCase();
  const url = `${UPSTREAM}/alpha/${encodeURIComponent(normalizedCode)}?fields=${DETAIL_FIELDS}`;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(getErrorMessage(response.status));
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('Country not found in API');
      }
      return data[0];
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Country not found in API');
    }

    return data;
  } catch (err) {
    const mock = mockCountryByCode(normalizedCode);
    if (mock) {
      return mock;
    }
    throw err instanceof Error ? err : new Error('Country not found in API');
  }
}
