import classes from '../Search/Search.module.css';

interface SearchFormProps {
  search: string;
  action?: string;
}

export function SearchForm({ search, action = '/' }: SearchFormProps) {
  return (
    <form action={action} method="get" className={classes.searchBox}>
      <input
        type="search"
        id="search"
        name="search"
        className={classes.search}
        placeholder="Search for a country…"
        defaultValue={search}
      />
      <label htmlFor="search" className={classes.searchLabel}>
        Search
      </label>
      <button type="submit" className={classes.searchButton} aria-label="Search">
        🔍
      </button>
    </form>
  );
}
