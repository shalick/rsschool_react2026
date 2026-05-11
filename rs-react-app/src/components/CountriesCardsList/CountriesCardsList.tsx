import { Component } from 'react';
import { CountryCard } from '../CountryCard/CountryCard';
import { Loader } from '../Loader/Loader';
import classes from './CountriesCardsList.module.css';

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

export class CardsList extends Component<IProps> {
  render() {
    const { countries, isLoading, error } = this.props;

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
          <CountryCard
            key={country.cca3}
            name={country.name}
            flags={country.flags}
            capital={country.capital}
            region={country.region}
            population={country.population}
          />
        ))}
      </ul>
    );
  }
}
