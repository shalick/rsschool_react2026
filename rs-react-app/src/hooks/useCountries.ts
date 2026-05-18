import { useState, useEffect, useCallback } from 'react';
import { fetchAllCountries, fetchCountriesByName } from '../api/countriesApi';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';

const ITEMS_PER_PAGE = 12;

export function useCountries() {
  const [allCountries, setAllCountries] = useState<ICountry[]>([]);
  const [searchResults, setSearchResults] = useState<ICountry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedTerm, setLastSearchedTerm] = useState<string>('');

  const [currentPage, setCurrentPage] = useState<number>(1);

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

  const searchCountries = useCallback(
    (trimmedTerm: string) => {
      if (trimmedTerm === lastSearchedTerm) {
        return;
      }

      setCurrentPage(1);

      if (trimmedTerm === '') {
        setSearchResults(null);
        setLastSearchedTerm('');
        setError(null);
        return;
      }

      setLastSearchedTerm(trimmedTerm);
      setIsLoading(true);
      setError(null);

      fetchCountriesByName(trimmedTerm)
        .then((data) => {
          setSearchResults(data);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message);
          setIsLoading(false);
        });
    },
    [lastSearchedTerm]
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
    searchCountries,
    currentPage,
    totalPages,
    setCurrentPage,
  };
}
