import { Link, useLocation } from 'react-router-dom';
import { CountryCard } from '../CountryCard/CountryCard';
import classes from './CountriesCardsList.module.css';
import { Loader } from '../Loader/Loader';

export interface ICountry {
  cca3: string;
  name: { common: string; official?: string };
  flags: { png: string; svg: string; alt?: string };
  capital?: string[];
  region: string;
  population: number;
  subregion?: string;
}

interface IProps {
  countries: ICountry[];
  isLoading: boolean;
  error: string | null;
  onOpenDetails?: (id: string) => void;
}

export function CardsList({
  countries,
  isLoading,
  error,
  onOpenDetails,
}: IProps) {
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
            key={country.cca3}
            {...country}
            onOpenDetails={onOpenDetails}
          />
        </Link>
      ))}
    </ul>
  );
}
