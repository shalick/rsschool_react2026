import React, { Component } from 'react';
import classes from './Search.module.css';

interface SearchProps {
  searchStr: string;
  onSearchChange: (value: string) => void;
}

export class Search extends Component<SearchProps> {
  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSearchChange(event.target.value);
  };

  render() {
    return (
      <div className={classes.searchBox}>
        <input
          type="search"
          id="search"
          className={classes.search}
          placeholder="Search country"
          autoFocus
          value={this.props.searchStr}
          onChange={this.handleInputChange}
        />
        <label htmlFor="search" className={classes.searchLabel}>
          Search
        </label>
      </div>
    );
  }
}
