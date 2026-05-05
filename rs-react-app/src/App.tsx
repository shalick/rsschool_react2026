import { Component } from 'react';
import classes from './App.module.css';
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
        <ErrorBoundary key={String(this.state.simulateError)}>
          <div className={classes.app}>
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
          {this.state.simulateError
            ? 'Reset Error Simulation'
            : 'Test Error Boundary'}
        </button>
      </>
    );
  }
}

export default App;
