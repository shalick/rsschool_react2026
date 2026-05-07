import { Component } from 'react';
import classes from './CountryCard.module.css';

interface ICountryCard {
  name: {
    common: string;
    official?: string;
  };
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  population: number;
  subregion?: string;
}

export class CountryCard extends Component<ICountryCard> {
  render = () => {
    const { name, flags, capital, region, population } = this.props;

    return (
      <li className={classes.country}>
        <img
          src={flags.svg}
          alt={flags.alt || `Flag of ${name.common}`}
          className={classes.flag}
        />
        <div className={classes.countryInfo}>
          <h3>{name.common}</h3>
          <div className={classes.details}>
            <p>
              <strong>Population:</strong> {population.toLocaleString()}
            </p>
            <p>
              <strong>Region:</strong> {region}
            </p>
            <p>
              <strong>Capital:</strong> {capital ? capital[0] : 'N/A'}
            </p>
          </div>
        </div>
      </li>
    );
  };
}
