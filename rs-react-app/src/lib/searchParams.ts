import {
  fetchAllCountriesServer,
  fetchCountriesByNameServer,
} from './countries.server';
import type { Country } from '../shared/types';

export const ITEMS_PER_PAGE = 12;

export function parsePageParam(page?: string): number {
  const parsed = Number(page);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

export function buildQueryString(search: string, page: number): string {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set('search', search.trim());
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function paginateCountries<T>(
  items: T[],
  page: number,
  perPage = ITEMS_PER_PAGE
) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    totalPages,
    currentPage: safePage,
    totalCount,
  };
}

export type SearchResultsData = {
  countries: Country[];
  search: string;
  currentPage: number;
  totalPages: number;
  queryString: string;
  error: string | null;
  totalCount: number;
};

export async function getSearchResultsData(searchParams: {
  search?: string;
  page?: string;
}): Promise<SearchResultsData> {
  const search = searchParams.search ?? '';
  const requestedPage = parsePageParam(searchParams.page);

  let allCountries: Country[];
  let error: string | null = null;

  try {
    allCountries = search.trim()
      ? await fetchCountriesByNameServer(search.trim())
      : await fetchAllCountriesServer();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load countries';
    allCountries = [];
  }

  const { items, totalPages, currentPage, totalCount } = paginateCountries(
    allCountries,
    requestedPage
  );

  return {
    countries: items,
    search,
    currentPage,
    totalPages,
    queryString: buildQueryString(search, currentPage),
    error,
    totalCount,
  };
}
