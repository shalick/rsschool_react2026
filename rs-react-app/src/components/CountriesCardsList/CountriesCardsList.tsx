import { Link, useLocation } from 'react-router-dom';
import { CountryCard } from '../CountryCard/CountryCard';
import classes from './CountriesCardsList.module.css';
import { Loader } from '../Loader/Loader';

export interface ICountry {
  cca3: string;
  name: { common: string };
  flags: { png: string; svg: string; alt?: string };
  capital?: string[];
  region: string;
  population: number;
}

interface IProps {
  countries: ICountry[];
  isLoading: boolean;
  error: string | null;
}

export function CardsList({ countries, isLoading, error }: IProps) {
  const location = useLocation();

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className={classes.error}>
        <p>⚠️ {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <ul className={classes.cardsContainer}>
      {countries.map((country) => (
        <Link
          key={country.cca3}
          to={{
            pathname: `/${country.cca3.toLowerCase()}`,
            search: location.search,
          }}
          className={classes.cardLink}
        >
          <CountryCard
            name={country.name}
            flags={country.flags}
            capital={country.capital}
            region={country.region}
            population={country.population}
          />
        </Link>
      ))}
    </ul>
  );
}
