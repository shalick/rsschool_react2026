'use client';

import { useActionState } from 'react';
import {
  searchCountriesAction,
  type SearchActionState,
} from '../../actions/searchCountries';
import classes from '../Search/Search.module.css';

interface SearchFormClientProps {
  search: string;
  activeCountryCode?: string;
}

export function SearchFormClient({
  search,
  activeCountryCode,
}: SearchFormClientProps) {
  const [, formAction, isPending] = useActionState<
    SearchActionState | null,
    FormData
  >(searchCountriesAction, null);

  return (
    <form action={formAction} className={classes.searchBox}>
      {activeCountryCode ? (
        <input type="hidden" name="activeCountryCode" value={activeCountryCode} />
      ) : null}
      <input
        type="search"
        id="search"
        name="search"
        className={classes.search}
        placeholder="Search for a country…"
        defaultValue={search}
        autoFocus
      />
      <label htmlFor="search" className={classes.searchLabel}>
        Search
      </label>
      <button
        type="submit"
        className={classes.searchButton}
        aria-label="Search"
        disabled={isPending}
      >
        {isPending ? '⏳' : '🔍'}
      </button>
    </form>
  );
}
