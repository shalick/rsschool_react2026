'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '../i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCountriesStore } from '../store/useCountriesStore';
import { CardsList } from '../components/CountriesCardsList/CountriesCardsList';
import { Search } from '../components/Search/Search';
import { Pagination } from '../components/Pagination/Pagination';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from '../components/ErrorSimulator/ErrorSimulator';
import classes from './HomePage.module.css';
import { Button } from '../components/Button/Button';
import { CountryDetails } from './CountryDetails';

export function HomePage() {
  const {
    countries,
    isLoading,
    error,
    fetchCountries,
    searchCountries,
    refreshCountries,
  } = useCountriesStore();

  const t = useTranslations('countries');
  const te = useTranslations('errors');

  const [searchStr, setSearchStr] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const router = useRouter();
  const params = useParams() as { countryCode?: string };
  const searchParams = useSearchParams();
  const countryCode = params.countryCode;
  const currentSearch = searchParams?.toString() ?? '';
  const queryString = currentSearch ? `?${currentSearch}` : '';

  useEffect(() => {
    if (searchStr.trim()) {
      searchCountries(searchStr);
    } else {
      fetchCountries();
    }
  }, [fetchCountries, searchCountries, searchStr]);

  const totalPages = Math.ceil((countries ?? []).length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const safeCountries = Array.isArray(countries) ? countries : [];
  const paginatedCountries = safeCountries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const changeSearch = (value: string) => {
    setSearchStr(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    refreshCountries();
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMainPanelClick = (e: React.MouseEvent) => {
    if (
      countryCode &&
      (e.target as HTMLElement).closest(`.${classes.leftSection}`)
    ) {
      router.push(`/${queryString}`);
    }
  };

  const [simulateError, setSimulateError] = useState(false);

  return (
    <>
      <ErrorBoundary key={String(simulateError)}>
        <div
          className={`${classes.homeLayout} ${
            countryCode ? classes.splitActive : ''
          }`}
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <Button
                    variant="secondary"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    {isLoading ? `🔄 ${t('refreshing')}` : `🔄 ${t('refresh')}`}
                  </Button>
                </div>
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
              <CountryDetails />
            </div>
          )}
        </div>
      </ErrorBoundary>

      <Button
        variant={simulateError ? 'secondary' : 'primary'}
        onClick={() => setSimulateError((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '2rem',
          zIndex: 2000,
          transition: 'background-color 0.2s ease, transform 0.1s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {simulateError ? te('resetBoundary') : te('testBoundary')}
      </Button>
    </>
  );
}

export default HomePage;
