import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCountriesStore } from '../store/useCountriesStore';
import { CardsList } from '../components/CountriesCardsList/CountriesCardsList';
import { Search } from '../components/Search/Search';
import { Pagination } from '../components/Pagination/Pagination';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from '../components/ErrorSimulator/ErrorSimulator';
import classes from './HomePage.module.css';

export function HomePage() {
  const { countries, isLoading, error, fetchCountries, searchCountries } =
    useCountriesStore();

  const [searchStr, setSearchStr] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (searchStr.trim()) {
      searchCountries(searchStr);
    } else {
      fetchCountries();
    }
  }, [fetchCountries, searchCountries, searchStr]);

  const totalPages = Math.ceil(countries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCountries = countries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const changeSearch = (value: string) => {
    setSearchStr(value);
    setCurrentPage(1);
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { countryCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMainPanelClick = (e: React.MouseEvent) => {
    if (
      countryCode &&
      (e.target as HTMLElement).closest(`.${classes.leftSection}`)
    ) {
      navigate({ pathname: '/', search: location.search });
    }
  };

  const [simulateError, setSimulateError] = useState(false);

  return (
    <>
      <ErrorBoundary key={String(simulateError)}>
        <div
          className={`${classes.homeLayout} ${countryCode ? classes.splitActive : ''}`}
          onClick={handleMainPanelClick}
        >
          <div className={classes.leftSection}>
            {simulateError ? (
              <ErrorSimulator />
            ) : (
              <>
                <Search
                  searchStr={searchStr}
                  onSearchChange={changeSearch}
                  onSearch={(val) => changeSearch(val)}
                />
                <CardsList
                  countries={paginatedCountries}
                  isLoading={isLoading}
                  error={error}
                />
                {!isLoading && !error && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </div>
          {countryCode && (
            <div className={classes.rightSection}>
              <Outlet />
            </div>
          )}
        </div>
      </ErrorBoundary>

      <button
        onClick={() => setSimulateError((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '2rem',
          padding: '0.75rem 1.5rem',
          background: simulateError ? '#42ba96' : '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 2000,
          transition: 'background-color 0.2s ease, transform 0.1s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {simulateError ? '🔄 Reset Error Simulation' : '⚠️ Test Error Boundary'}
      </button>
    </>
  );
}
