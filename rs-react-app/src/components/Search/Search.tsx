import React, { Component, createRef } from 'react';
import classes from './Search.module.css';

interface SearchProps {
  searchStr: string;
  onSearchChange: (value: string) => void;
}

export class Search extends Component<SearchProps> {
  private inputRef = createRef<HTMLInputElement>();

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSearchChange(event.target.value);
  };

  handleButtonClick = () => {
    this.inputRef.current?.focus();
  };

  render() {
    return (
      <div className={classes.searchBox}>
        <input
          type="search"
          id="search"
          className={classes.search}
          placeholder="Search for a country…"
          autoFocus
          value={this.props.searchStr}
          onChange={this.handleInputChange}
          ref={this.inputRef}
        />
        <label htmlFor="search" className={classes.searchLabel}>
          Search
        </label>
        <button
          type="button"
          className={classes.searchButton}
          onClick={this.handleButtonClick}
          aria-label="Search"
        >
          🔍
        </button>
      </div>
    );
  }
}
