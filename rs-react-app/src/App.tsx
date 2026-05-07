import { Component } from 'react';
import classes from './App.module.css';
import { CardsList } from './components/CountriesCardsList/CountriesCardsList';
import { Search } from './components/Search/Search';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from './components/ErrorSimulator/ErrorSimulator';
import { fetchAllCountries, fetchCountriesByName } from './api/Countriesapi';
import type { ICountry } from './components/CountriesCardsList/CountriesCardsList';

interface AppState {
  searchStr: string;
  allCountries: ICountry[];
  searchResults: ICountry[] | null;
  isLoading: boolean;
  error: string | null;
  lastSearchedTerm: string;
  simulateError: boolean;
}

class App extends Component<Record<string, never>, AppState> {
  constructor(props: Record<string, never>) {
    super(props);
    const saved = localStorage.getItem('searchStr');
    this.state = {
      searchStr: saved || '',
      allCountries: [],
      searchResults: null,
      isLoading: true,
      error: null,
      lastSearchedTerm: '',
      simulateError: false,
    };
  }

  componentDidMount() {
    fetchAllCountries()
      .then((data) => this.setState({ allCountries: data, isLoading: false }))
      .catch((error: Error) =>
        this.setState({ error: error.message, isLoading: false })
      );
  }

  handleSearchChange = (newStr: string) => {
    this.setState({ searchStr: newStr });
    localStorage.setItem('searchStr', newStr);
  };

  handleSearch = (trimmedTerm: string) => {
    const { lastSearchedTerm } = this.state;

    if (trimmedTerm === lastSearchedTerm) {
      return;
    }

    if (trimmedTerm === '') {
      this.setState({
        searchResults: null,
        lastSearchedTerm: '',
        error: null,
      });
      return;
    }

    this.setState({
      lastSearchedTerm: trimmedTerm,
      isLoading: true,
      error: null,
    });

    fetchCountriesByName(trimmedTerm)
      .then((data) => {
        this.setState({
          searchResults: data,
          isLoading: false,
        });
      })
      .catch((error: Error) => {
        this.setState({
          error: error.message,
          isLoading: false,
        });
      });
  };

  toggleError = () => {
    this.setState((prevState) => ({
      simulateError: !prevState.simulateError,
    }));
  };

  componentWillUnmount() {
    localStorage.setItem('searchStr', this.state.searchStr);
  }

  render() {
    const {
      searchStr,
      allCountries,
      searchResults,
      isLoading,
      error,
      simulateError,
    } = this.state;

    const countries = searchResults !== null ? searchResults : allCountries;

    return (
      <>
        <ErrorBoundary key={String(simulateError)}>
          <div className={classes.app}>
            {simulateError ? (
              <ErrorSimulator />
            ) : (
              <>
                <Search
                  searchStr={searchStr}
                  onSearchChange={this.handleSearchChange}
                  onSearch={this.handleSearch}
                />
                <CardsList
                  countries={countries}
                  isLoading={isLoading}
                  error={error}
                />
              </>
            )}
          </div>
        </ErrorBoundary>

        <button
          onClick={this.toggleError}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '0.6rem 1.2rem',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '2rem',
            cursor: 'pointer',
            boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          {simulateError ? 'Reset Error Simulation' : 'Test Error Boundary'}
        </button>
      </>
    );
  }
}

export default App;
