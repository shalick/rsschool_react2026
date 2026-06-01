import { useLocation } from 'react-router-dom';
import { CountryCard } from '../CountryCard/CountryCard';
import { useCountriesStore } from '../../store/useCountriesStore';
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
}

export function CardsList({ countries, isLoading, error }: IProps) {
  const location = useLocation();
  const { refreshCountries } = useCountriesStore();

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className={classes.error}>
        <p>⚠️ {error}</p>
        <button onClick={() => refreshCountries()}>Retry</button>
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
