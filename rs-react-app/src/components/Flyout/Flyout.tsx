'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { useSelectionStore } from '../../store/useSelectionStore';
import { useCountriesStore } from '../../store/useCountriesStore';
import { generateCsvAction, type CsvActionState } from '../../actions/generateCsv';
import classes from './Flyout.module.css';

const initialState: CsvActionState = { csv: null, error: null };

export const Flyout = () => {
  const t = useTranslations('flyout');
  const { selectedIds, clearSelections } = useSelectionStore();
  const { countries } = useCountriesStore();
  const selectedCount = selectedIds.size;
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(generateCsvAction, initialState);

  useEffect(() => {
    if (!state.csv) return;

    const blob = new Blob(['\uFEFF' + state.csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCount}_items.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.csv, selectedCount]);

  if (selectedCount === 0) return null;

  const selectedCountries = (Array.isArray(countries) ? countries : []).filter(
    (c) => selectedIds.has(c.cca3)
  );

  return (
    <div className={classes.flyout}>
      <div className={classes.content}>
        <span className={classes.count}>
          {t('selected', { count: selectedCount })}
        </span>
        <div className={classes.buttons}>
          <button
            type="button"
            onClick={clearSelections}
            className={classes.unselectBtn}
          >
            {t('unselectAll')}
          </button>
          <form ref={formRef} action={formAction}>
            <input
              type="hidden"
              name="countries"
              value={JSON.stringify(selectedCountries)}
            />
            <button
              type="submit"
              disabled={isPending}
              className={classes.downloadBtn}
            >
              {isPending ? '⏳' : t('download')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
