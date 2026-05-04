import React, { Component } from 'react';
import './App.css';
import { CardsList } from './components/CountriesCardsList/CountriesCardsList';
import { Search } from './components/Search/Search';

interface AppState {
  searchStr: string;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      searchStr: localStorage.getItem('searchStr') || '',
    };
  }

  handleSearchChange = (newStr: string) => {
    this.setState({ searchStr: newStr });
    localStorage.setItem('searchStr', newStr);
  };

  componentWillUnmount() {
    localStorage.setItem('searchStr', this.state.searchStr);
  }

  render() {
    return (
      <>
        <Search
          searchStr={this.state.searchStr}
          onSearchChange={this.handleSearchChange}
        />
        <CardsList searchStr={this.state.searchStr} />
      </>
    );
  }
}

export default App;
