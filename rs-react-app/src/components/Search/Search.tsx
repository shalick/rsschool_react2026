import React, { useCallback, useRef } from 'react';
import classes from './Search.module.css';

interface SearchProps {
  searchStr: string;
  onSearchChange: (value: string) => void;
  onSearch: (trimmedValue: string) => void;
}

function SearchComponent({ searchStr, onSearchChange, onSearch }: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  }, [onSearchChange]);

  const handleButtonClick = useCallback(() => {
    const trimmed = searchStr.trim();
    onSearch(trimmed);
    inputRef.current?.focus();
  }, [searchStr, onSearch]);

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

export const Search = React.memo(SearchComponent);
