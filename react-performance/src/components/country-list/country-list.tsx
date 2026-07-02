import type { Country } from '../../types';
import type { ListChildComponentProps } from 'react-window';
import { CountryCard } from '../country-card/country-card';
import { getPopulationForYear, createYearDataMap } from '../../utils/data-transformers';
import { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

import styles from './country-list.module.css';

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedRegion: string;
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  onYearChange?: (year: number) => void;
};

export const CountryList = ({
  countries,
  searchQuery,
  selectedColumns,
  selectedRegion,
  selectedYear,
  sortField,
  sortOrder,
}: CountryListProps) => {
  const filteredCountries = useMemo(() => {
    const result = countries
      .filter((c) => {
        const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = !selectedRegion || c.data.some((d) => d.region === selectedRegion);
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        } else {
          const popA = getPopulationForYear(createYearDataMap(a.data), selectedYear) || 0;
          const popB = getPopulationForYear(createYearDataMap(b.data), selectedYear) || 0;
          return sortOrder === 'asc' ? popA - popB : popB - popA;
        }
      });

    return result;
  }, [countries, searchQuery, selectedRegion, selectedYear, sortField, sortOrder]);

  const Row = ({ index, style }: ListChildComponentProps) => {
    const country = filteredCountries[index];
    return (
      <div style={style}>
        <CountryCard country={country} selectedYear={selectedYear} selectedColumns={selectedColumns} />
      </div>
    );
  };

  const itemCount = filteredCountries.length;
  const itemSize = 180 + selectedColumns.length * 28;
  const height = Math.min(600, itemCount * itemSize);

  return (
    <div className={styles.countryList}>
      <List height={height} itemCount={itemCount} itemSize={itemSize} width="100%" itemKey={(index) => filteredCountries[index].id}>
        {Row}
      </List>
    </div>
  );
};
