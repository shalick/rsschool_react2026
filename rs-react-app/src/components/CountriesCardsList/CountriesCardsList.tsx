import { Component } from 'react';
import { CountryCard } from '../CountryCard/CountryCard';
import { Loader } from '../Loader/Loader';
import { fetchAllCountries } from '../../api/Countriesapi';
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
  searchStr?: string;
}

interface IState {
  countries: ICountry[];
  isLoading: boolean;
  error: string | null;
}

export class CardsList extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      countries: [],
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    fetchAllCountries()
      .then((data) => {
        this.setState({ countries: data, isLoading: false });
      })
      .catch((error: Error) => {
        this.setState({
          error: error.message,
          isLoading: false,
        });
      });
  }

  render() {
    const { countries, isLoading, error } = this.state;
    const { searchStr = '' } = this.props;

    if (isLoading) return <Loader />;

    if (error) {
      return (
        <div className={classes.error}>
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }

    const filtered = searchStr.trim()
      ? countries.filter((c) =>
          c.name.common.toLowerCase().includes(searchStr.toLowerCase())
        )
      : countries;

    return (
      <ul className={classes.cardsContainer}>
        {filtered.map((country) => (
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
