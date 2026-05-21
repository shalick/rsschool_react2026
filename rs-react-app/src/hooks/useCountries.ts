import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAllCountries, fetchCountriesByName } from '../api/countriesApi';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';

const ITEMS_PER_PAGE = 12;

export function useCountries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const searchStr = searchParams.get('search') || '';
  const [allCountries, setAllCountries] = useState<ICountry[]>([]);
  const [searchResults, setSearchResults] = useState<ICountry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCountries()
      .then((data) => {
        setAllCountries(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchStr === '') {
      setSearchResults(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchCountriesByName(searchStr)
      .then((data) => {
        setSearchResults(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setSearchResults([]);
        setIsLoading(false);
      });
  }, [searchStr]);

  const changeSearch = useCallback(
    (newSearch: string) => {
      setSearchParams({ search: newSearch, page: '1' });
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      setSearchParams({ search: searchStr, page: String(page) });
    },
    [searchStr, setSearchParams]
  );

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
