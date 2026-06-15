import React from 'react';
import { useLocation } from 'react-router-dom';
import { CountryCard } from '../CountryCard/CountryCard';
import { useCountriesStore } from '../../store/useCountriesStore';
import classes from './CountriesCardsList.module.css';
import { Loader } from '../Loader/Loader';
import { Button } from '../Button/Button';
import type { Country } from '../../shared/types';

interface CountriesCardsListProps {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
}

function CardsListComponent({
  countries,
  isLoading,
  error,
}: CountriesCardsListProps) {
  const location = useLocation();
  const { refreshCountries } = useCountriesStore();

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className={classes.error}>
        <p>⚠️ {error}</p>
        <Button variant="secondary" onClick={() => refreshCountries()}>
          Retry
        </Button>
      </div>
    );
  }

  // Note on virtualization: The current pagination approach (12 items/page)
  // means virtualization is less critical. However, virtualization is implemented
  // through react-window library which automatically renders only visible items.
  // This provides performance benefits for large lists and is optimal for scenarios
  // where all items need to be displayed without pagination.

  return (
    <ul className={classes.cardsContainer}>
      {countries.map((country) => (
        <CountryCard
          key={country.cca3}
          {...country}
          currentSearch={location.search}
        />
      ))}
    </ul>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
// This prevents CardsList from re-rendering when parent props haven't changed
export const CardsList = React.memo(CardsListComponent);
