import React, { Component } from 'react';
import { CountryCard } from '../CountryCard/CountryCard';
import classes from './CountriesCardsList.module.css';

export interface ICountry {
  cca3: string;
  name: {
    common: string;
  };
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  population: number;
}

interface IState {
  countries: ICountry[];
  isLoading: boolean;
  error: string | null;
}

export class CardsList extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      countries: [],
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    fetch('/api/v3.1/all?fields=name,flags,capital,region,population,cca3')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
        return response.json();
      })
      .then((data: ICountry[]) => {
        this.setState({ countries: data, isLoading: false });
      })
      .catch((error) => {
        console.error('Fetch error details:', error);
        this.setState({
          error:
            'The API returned HTML instead of data. This usually means the service is temporarily down or blocking the request.',
          isLoading: false,
        });
      });
  }

  render() {
    const { countries, isLoading, error } = this.state;

    if (isLoading)
      return <div className={classes.loader}>Loading countries...</div>;
    if (error) return <div className={classes.error}>Error: {error}</div>;

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
