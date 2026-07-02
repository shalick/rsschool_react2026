import styles from './year-selector.module.css';
import { memo } from 'react';

type YearSelectorProps = {
  year: number;
  years: number[];
  onChange: (year: number) => void;
};

const YearSelectorComponent = ({ year, years, onChange }: YearSelectorProps) => {
  return (
    <div className={styles.container}>
      <label htmlFor="year" className={styles.label}>
        Select year:
      </label>
      <select
        id="year"
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.select}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export const YearSelector = memo(YearSelectorComponent);
