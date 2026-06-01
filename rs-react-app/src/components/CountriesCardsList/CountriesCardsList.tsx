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

export function CardsList({
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
