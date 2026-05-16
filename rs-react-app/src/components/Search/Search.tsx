import React, { useRef } from 'react';
import classes from './Search.module.css';

interface SearchProps {
  searchStr: string;
  onSearchChange: (value: string) => void;
  onSearch: (trimmedValue: string) => void;
}

export function Search({ searchStr, onSearchChange, onSearch }: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleButtonClick = () => {
    const trimmed = searchStr.trim();
    onSearch(trimmed);
    inputRef.current?.focus();
  };

  return (
    <div className={classes.searchBox}>
      <input
        type="search"
        id="search"
        className={classes.search}
        placeholder="Search for a country…"
        autoFocus
        value={searchStr}
        onChange={handleInputChange}
        ref={inputRef}
      />
      <label htmlFor="search" className={classes.searchLabel}>
        Search
      </label>
      <button
        type="button"
        className={classes.searchButton}
        onClick={handleButtonClick}
        aria-label="Search"
      >
        🔍
      </button>
    </div>
  );
}
