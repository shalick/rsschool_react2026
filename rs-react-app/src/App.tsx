import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import classes from './App.module.css';
import { CardsList } from './components/CountriesCardsList/CountriesCardsList';
import { Search } from './components/Search/Search';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from './components/ErrorSimulator/ErrorSimulator';
import { fetchAllCountries, fetchCountriesByName } from './api/countriesApi';
import type { ICountry } from './components/CountriesCardsList/CountriesCardsList';

export default function App() {
  const [searchStr, setSearchStr] = useLocalStorage<string>('searchStr', '');
  const [allCountries, setAllCountries] = useState<ICountry[]>([]);
  const [searchResults, setSearchResults] = useState<ICountry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedTerm, setLastSearchedTerm] = useState<string>('');
  const [simulateError, setSimulateError] = useState<boolean>(false);

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

  const handleSearchChange = (newStr: string) => {
    setSearchStr(newStr);
  };

  const handleSearch = (trimmedTerm: string) => {
    if (trimmedTerm === lastSearchedTerm) {
      return;
    }

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
  };

  const toggleError = () => {
    setSimulateError((prev) => !prev);
  };

  const countries = searchResults !== null ? searchResults : allCountries;

  return (
    <>
      <ErrorBoundary key={String(simulateError)}>
        <div className={classes.app}>
          {simulateError ? (
            <ErrorSimulator />
          ) : (
            <>
              <Search
                searchStr={searchStr}
                onSearchChange={handleSearchChange}
                onSearch={handleSearch}
              />
              <CardsList
                countries={countries}
                isLoading={isLoading}
                error={error}
              />
            </>
          )}
        </div>
      </ErrorBoundary>

      <button
        onClick={toggleError}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '0.6rem 1.2rem',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '2rem',
          cursor: 'pointer',
          boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}
      >
        {simulateError ? 'Reset Error Simulation' : 'Test Error Boundary'}
      </button>
    </>
  );
}
