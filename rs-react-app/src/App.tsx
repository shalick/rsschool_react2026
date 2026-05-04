import React, { Component } from 'react';
import './App.css';
import { CardsList } from './components/CountriesCardsList/CountriesCardsList';
import { Search } from './components/Search/Search';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from './components/ErrorSimulator/ErrorSimulator';

interface AppState {
  searchStr: string;
  simulateError: boolean;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      searchStr: localStorage.getItem('searchStr') || '',
      simulateError: false,
    };
  }

  handleSearchChange = (newStr: string) => {
    this.setState({ searchStr: newStr });
    localStorage.setItem('searchStr', newStr);
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
    return (
      <>
        <button
          onClick={this.toggleError}
          style={{
            margin: '1rem',
            padding: '0.5rem 1rem',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {this.state.simulateError
            ? 'Reset Error Simulation'
            : 'Test Error Boundary'}
        </button>

        <ErrorBoundary>
          {this.state.simulateError ? (
            <ErrorSimulator />
          ) : (
            <>
              <Search
                searchStr={this.state.searchStr}
                onSearchChange={this.handleSearchChange}
              />
              <CardsList searchStr={this.state.searchStr} />
            </>
          )}
        </ErrorBoundary>
      </>
    );
  }
}

export default App;
