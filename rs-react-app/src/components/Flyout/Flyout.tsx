import { useSelectionStore } from '../../store/useSelectionStore';
import { useCountriesStore } from '../../store/useCountriesStore';
import classes from './Flyout.module.css';

export const Flyout = () => {
  const { selectedIds, clearSelections } = useSelectionStore();
  const { countries } = useCountriesStore(); // get full list
  const selectedCount = selectedIds.size;

  const handleDownload = () => {
    const selectedCountries = countries.filter((c) => selectedIds.has(c.cca3));
    const dataStr = JSON.stringify(selectedCountries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-countries-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedCount === 0) return null;

  return (
    <div className={classes.flyout}>
      <div className={classes.content}>
        <span className={classes.count}>
          Selected: {selectedCount} country{selectedCount !== 1 ? 's' : ''}
        </span>
        <div className={classes.buttons}>
          <button onClick={clearSelections} className={classes.unselectBtn}>
            Unselect all
          </button>
          <button onClick={handleDownload} className={classes.downloadBtn}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
