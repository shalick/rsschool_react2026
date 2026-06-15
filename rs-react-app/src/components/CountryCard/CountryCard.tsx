import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { useSelectionStore } from '../../store/useSelectionStore';
import { queryClient } from '../../query/queryClient';
import { fetchCountryByCode } from '../../api/countriesApi';
import classes from './CountryCard.module.css';
import type { Country } from '../../shared/types';

type CountryCardProps = Country & { currentSearch?: string };

function CountryCardComponent({
  cca3,
  name,
  flags,
  capital,
  region,
  population,
  currentSearch = '',
}: CountryCardProps) {
  const navigate = useNavigate();
  const { selectedIds, toggleSelection } = useSelectionStore();
  const isSelected = useMemo(() => selectedIds.has(cca3), [selectedIds, cca3]);
  const countryCode = useMemo(() => cca3.toLowerCase(), [cca3]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSelection(cca3);
  }, [cca3, toggleSelection]);

  const prefetchCountryDetails = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['country', countryCode],
      queryFn: () => fetchCountryByCode(countryCode),
    });
  }, [countryCode]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${countryCode}${currentSearch}`);
  }, [navigate, countryCode, currentSearch]);

  return (
    <li
      className={classes.country}
      onClick={handleCardClick}
      onMouseEnter={prefetchCountryDetails}
      onFocus={prefetchCountryDetails}
      tabIndex={0}
    >
      <img
        src={flags.svg}
        alt={flags.alt || `Flag of ${name.common}`}
        className={classes.flag}
      />
      <div className={classes.countryInfo}>
        <h3>{name.common}</h3>
        <div className={classes.details}>
          <p>
            <strong>Population:</strong> {population.toLocaleString()}
          </p>
          <p>
            <strong>Region:</strong> {region}
          </p>
          <p>
            <strong>Capital:</strong> {capital ? capital[0] : 'N/A'}
          </p>
        </div>
      </div>
      <div className={classes.checkboxContainer}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </li>
  );
}

export const CountryCard = React.memo(CountryCardComponent);
