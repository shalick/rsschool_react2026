import classes from '../CountriesCardsList/CountriesCardsList.module.css';

interface SearchResultsErrorProps {
  message: string;
}

export function SearchResultsError({ message }: SearchResultsErrorProps) {
  return (
    <div className={classes.error}>
      <p>⚠️ {message}</p>
    </div>
  );
}
