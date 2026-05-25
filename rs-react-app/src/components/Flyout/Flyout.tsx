import { useSelectionStore } from '../../store/useSelectionStore';
import { useCountriesStore } from '../../store/useCountriesStore';
import classes from './Flyout.module.css';

export const Flyout = () => {
  const { selectedIds, clearSelections } = useSelectionStore();
  const { countries } = useCountriesStore();
  const selectedCount = selectedIds.size;

  const handleDownload = () => {
    if (selectedCount === 0) return;

    const selectedCountries = countries.filter((c) => selectedIds.has(c.cca3));

    const headers = [
      'Name',
      'Official Name',
      'Region',
      'Subregion',
      'Capital',
      'Population',
      'Flag URL (SVG)',
      'Flag Alt Text',
      'Details URL',
    ];

    const rows = selectedCountries.map((country) => [
      country.name.common,
      country.name.official || '',
      country.region,
      country.subregion || '',
      country.capital ? country.capital.join(', ') : 'N/A',
      country.population,
      country.flags.svg,
      country.flags.alt || `Flag of ${country.name.common}`,
      `/${country.cca3.toLowerCase()}`,
    ]);

    const escapeCSV = (cell: string | number) => {
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCount}_items.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
