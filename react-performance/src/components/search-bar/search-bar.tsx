import styles from './search-bar.module.css';
import { memo } from 'react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const SearchBarComponent = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className={styles.container}>
      <label htmlFor="search" className={styles.label}>
        Search countries:
      </label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type to search..."
        className={styles.input}
      />
    </div>
  );
};

export const SearchBar = memo(SearchBarComponent);
