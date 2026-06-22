import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchAllCountries, fetchCountriesByName } from '../api/countriesApi';
import type { Country } from '../shared/types';

const ITEMS_PER_PAGE = 12;

export function useCountries() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams?.get('page')) || 1;
  const searchStr = searchParams?.get('search') || '';
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [searchResults, setSearchResults] = useState<Country[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllCountries();
        if (!mounted) return;
        setAllCountries(data);
      } catch (err) {
        if (!mounted) return;
        setError((err as Error).message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (searchStr === '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults(null);
      setError(null);
      return;
    }

    let mounted = true;

    const load = async () => {
      setError(null);
      try {
        setIsLoading(true);
        const data = await fetchCountriesByName(searchStr);
        if (!mounted) return;
        setSearchResults(data);
      } catch (err) {
        if (!mounted) return;
        setError((err as Error).message);
        setSearchResults([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [searchStr]);

  const changeSearch = useCallback((newSearch: string) => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('search', newSearch);
      params.set('page', '1');
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  }, [searchParams]);

  const setPage = useCallback((page: number) => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('page', String(page));
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  }, [searchParams]);

  const sourceCountries = searchResults !== null ? searchResults : allCountries;
  const totalPages = Math.ceil(sourceCountries.length / ITEMS_PER_PAGE);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const paginatedCountries = sourceCountries.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return {
    countries: paginatedCountries,
    isLoading,
    error,
    searchStr,
    changeSearch,
    currentPage,
    totalPages,
    setPage,
  };
}
