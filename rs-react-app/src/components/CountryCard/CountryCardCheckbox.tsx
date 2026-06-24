'use client';

import { useSelectionStore } from '../../store/useSelectionStore';
import classes from './CountryCard.module.css';

interface CountryCardCheckboxProps {
  cca3: string;
}

export function CountryCardCheckbox({ cca3 }: CountryCardCheckboxProps) {
  const { selectedIds, toggleSelection } = useSelectionStore();
  const isSelected = selectedIds.has(cca3);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    toggleSelection(cca3);
  };

  return (
    <div className={classes.checkboxContainer}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
