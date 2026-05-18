import { useState } from 'react';
import classes from './App.module.css';
import { CardsList } from './components/CountriesCardsList/CountriesCardsList';
import { Search } from './components/Search/Search';
import { Pagination } from './components/Pagination/Pagination';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from './components/ErrorSimulator/ErrorSimulator';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useCountries } from './hooks/useCountries';

export default function App() {
  const [searchStr, setSearchStr] = useLocalStorage<string>('searchStr', '');

  const {
    countries,
    isLoading,
    error,
    searchCountries,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useCountries();

  const [simulateError, setSimulateError] = useState<boolean>(false);

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
                onSearchChange={setSearchStr}
                onSearch={searchCountries}
              />
              <CardsList
                countries={countries}
                isLoading={isLoading}
                error={error}
              />
              {!isLoading && !error && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </ErrorBoundary>

      <button
        onClick={() => setSimulateError((prev) => !prev)}
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
