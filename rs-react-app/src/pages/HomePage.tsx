import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCountriesStore } from '../store/useCountriesStore';
import { useSubmissionStore, type Gender } from '../store/useSubmissionStore';
import { CardsList } from '../components/CountriesCardsList/CountriesCardsList';
import { Search } from '../components/Search/Search';
import { Pagination } from '../components/Pagination/Pagination';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from '../components/ErrorSimulator/ErrorSimulator';
import { Modal } from '../components/Modal/Modal';
import { ModalForms } from '../components/Modal/ModalForms';
import { SubmissionCardsList } from '../components/SubmissionCardsList/SubmissionCardsList';
import classes from './HomePage.module.css';
import { Button } from '../components/Button/Button';

export function HomePage() {
  const {
    countries,
    isLoading,
    error,
    fetchCountries,
    searchCountries,
    refreshCountries,
  } = useCountriesStore();

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

  const handleRefresh = () => {
    setCurrentPage(1);
    refreshCountries();
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
  const [openFormType, setOpenFormType] = useState<'uncontrolled' | 'react-hook-form' | null>(null);
  const addSubmission = useSubmissionStore((state) => state.addSubmission);

  const closeModal = () => setOpenFormType(null);

  const handleFormSubmit = (values: {
    name: string;
    age: number;
    email: string;
    gender: Gender;
    acceptedTerms: boolean;
    message: string;
    image: string;
    password: string;
    confirmPassword: string;
    country: string;
  }) => {
    addSubmission({ type: openFormType ?? 'uncontrolled', ...values });
    closeModal();
  };

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
                <div className={classes.modalActions}>
                  <Button
                    variant="primary"
                    onClick={() => setOpenFormType('uncontrolled')}
                    disabled={isLoading}
                  >
                    Open Uncontrolled Form
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setOpenFormType('react-hook-form')}
                    disabled={isLoading}
                  >
                    Open React Hook Form
                  </Button>
                </div>
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
                    {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
                  </Button>
                </div>
                <CardsList
                  countries={paginatedCountries}
                  isLoading={isLoading}
                  error={error}
                />
                <Modal
                  open={Boolean(openFormType)}
                  title={
                    openFormType === 'react-hook-form'
                      ? 'React Hook Form'
                      : 'Uncontrolled Form'
                  }
                  onClose={closeModal}
                >
                  {openFormType && (
                    <ModalForms
                      type={openFormType}
                      onSubmit={handleFormSubmit}
                    />
                  )}
                </Modal>
                <SubmissionCardsList />
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
        {simulateError ? '🔄 Reset Error Simulation' : '⚠️ Test Error Boundary'}
      </Button>
    </>
  );
}
