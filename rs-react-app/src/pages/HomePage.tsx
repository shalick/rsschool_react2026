import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCountriesStore } from '../store/useCountriesStore';
import { CardsList } from '../components/CountriesCardsList/CountriesCardsList';
import { Search } from '../components/Search/Search';
import { Pagination } from '../components/Pagination/Pagination';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from '../components/ErrorSimulator/ErrorSimulator';
import classes from './HomePage.module.css';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';

export function HomePage() {
  const { countries, isLoading, error } = useCountriesStore();

  const [searchStr, setSearchStr] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<ICountry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (!searchStr.trim()) {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter((c) =>
        c.name.common.toLowerCase().includes(searchStr.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
    setCurrentPage(1);
  }, [searchStr, countries]);

  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCountries = filteredCountries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const changeSearch = (value: string) => {
    setSearchStr(value);
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
    </>
  );
}
