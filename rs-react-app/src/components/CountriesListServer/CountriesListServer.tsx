import { CountryCard } from '../CountryCard/CountryCard';
import classes from '../CountriesCardsList/CountriesCardsList.module.css';
import type { Country } from '../../shared/types';

interface CountriesListServerProps {
  countries: Country[];
  queryString: string;
}

export function CountriesListServer({
  countries,
  queryString,
}: CountriesListServerProps) {
  if (countries.length === 0) {
    return <p className={classes.error}>No countries found.</p>;
  }

  return (
    <ul className={classes.cardsContainer}>
      {countries.map((country) => (
        <CountryCard
          key={country.cca3}
          {...country}
          currentSearch={queryString}
        />
      ))}
    </ul>
  );
}
