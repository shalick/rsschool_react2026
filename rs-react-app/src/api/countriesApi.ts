import type { Country } from '../shared/types';

// ---------------------------------------------------------------------------
// v5 API response shapes
// ---------------------------------------------------------------------------

interface V5CountryObject {
  codes: { alpha_3: string };
  names: { common: string; official: string };
  flag: { url_svg: string; description?: string };
  capitals: Array<{ name: string }>;
  region: string;
  population: number;
  subregion?: string;
  languages?: Array<{ name: string }>;
}

interface V5ListResponse {
  data: {
    objects: V5CountryObject[];
    meta: { total: number; count: number; limit: number; offset: number; more: boolean };
  };
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

/** Map a v5 API object to the internal Country type used across the app. */
function toCountry(obj: V5CountryObject): Country {
  return {
    cca3: obj.codes.alpha_3 || obj.names.common.slice(0, 3).toUpperCase(),
    name: { common: obj.names.common, official: obj.names.official },
    flags: { png: '', svg: obj.flag.url_svg, alt: obj.flag.description },
    capital: obj.capitals?.map((c) => c.name),
    region: obj.region,
    population: obj.population,
    subregion: obj.subregion,
  };
}

// Fields we request for list views — keeps responses small.
const LIST_FIELDS =
  'response_fields=names.common,names.official,flag.url_svg,flag.description,capitals,region,population,codes.alpha_3';

// Fields we request for the detail view.
const DETAIL_FIELDS =
  'response_fields=names.common,names.official,flag.url_svg,flag.description,subregion,languages,codes.alpha_3';

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

const getErrorMessage = (status: number): string => {
  switch (true) {
    case status === 400:
      return 'Bad request. Please try again later.';
    case status === 401:
      return 'API key missing or invalid. Please check your configuration.';
    case status === 403:
      return 'Access denied. Your account may be pending approval or the monthly limit has been reached.';
    case status === 404:
      return 'The requested data could not be found.';
    case status === 429:
      return 'Too many requests. Please wait a moment and try again.';
    case status >= 500:
      return 'Server error. We\u2019re working on it \u2013 please try again soon.';
    default:
      return `Unexpected error (status ${status}). Please try again.`;
  }
};

async function getJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Fetch all countries by paging through the v5 API (max 100 per page).
 * 249 countries → 3 requests: offsets 0, 100, 200.
 */
export async function fetchAllCountries(): Promise<Country[]> {
  const PAGE_SIZE = 100;
  const firstPage = await getJson<V5ListResponse>(
    `/api/countries/v5?limit=${PAGE_SIZE}&offset=0&${LIST_FIELDS}`
  );

  const { objects, meta } = firstPage.data;
  const allObjects: V5CountryObject[] = [...objects];

  // Fetch remaining pages in parallel
  if (meta.more) {
    const remainingOffsets: number[] = [];
    for (let offset = PAGE_SIZE; offset < meta.total; offset += PAGE_SIZE) {
      remainingOffsets.push(offset);
    }
    const pages = await Promise.all(
      remainingOffsets.map((offset) =>
        getJson<V5ListResponse>(
          `/api/countries/v5?limit=${PAGE_SIZE}&offset=${offset}&${LIST_FIELDS}`
        )
      )
    );
    for (const page of pages) {
      allObjects.push(...page.data.objects);
    }
  }

  return allObjects.map(toCountry);
}

/**
 * Search countries by name using the v5 aggregate endpoint.
 * Returns an empty array when nothing matches (404).
 */
export async function fetchCountriesByName(name: string): Promise<Country[]> {
  const url = `/api/countries/v5/name?q=${encodeURIComponent(name)}&limit=100&${LIST_FIELDS}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  if (response.status === 404) return [];
  if (!response.ok) throw new Error(getErrorMessage(response.status));

  const json = (await response.json()) as V5ListResponse;
  return json.data.objects.map(toCountry);
}

// ---------------------------------------------------------------------------
// Country detail
// ---------------------------------------------------------------------------

export interface ICountryDetail {
  name: { common: string; official: string };
  flags: { svg: string; alt?: string };
  subregion?: string;
  /** Language names as a flat list, e.g. ["English", "French"] */
  languages?: string[];
}

/**
 * Fetch a single country by its alpha-3 code using the v5 read-by-property endpoint.
 */
export async function fetchCountryByCode(code: string): Promise<ICountryDetail> {
  const url = `/api/countries/v5/codes.alpha_3/${encodeURIComponent(code.toUpperCase())}?${DETAIL_FIELDS}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  const json = (await response.json()) as V5ListResponse;
  const obj = json.data?.objects?.[0];

  if (!obj) throw new Error('Country not found.');

  return {
    name: { common: obj.names.common, official: obj.names.official },
    flags: { svg: obj.flag.url_svg, alt: obj.flag.description },
    subregion: obj.subregion,
    languages: obj.languages?.map((l) => l.name),
  };
}
